use pulldown_cmark::{Event, Tag, TagEnd, Options, Parser};
use crate::types::{UnsupportedElement, UnsupportedMode};
use crate::errors::unsupported_element_error;

pub struct ProcessorState {
    pub output: String,
    pub unsupported_elements: Vec<UnsupportedElement>,
    pub mode: UnsupportedMode,
    pub list_stack: Vec<Option<u64>>,
    pub in_heading: bool,
    pub heading_text: String,
    pub in_link: bool,
    pub link_text: String,
    pub link_url: String,
    pub in_image: bool,
    pub image_alt: String,
    pub image_url: String,
}

impl ProcessorState {
    pub fn new(mode: UnsupportedMode) -> Self {
        Self {
            output: String::new(),
            unsupported_elements: Vec::new(),
            mode,
            list_stack: Vec::new(),
            in_heading: false,
            heading_text: String::new(),
            in_link: false,
            link_text: String::new(),
            link_url: String::new(),
            in_image: false,
            image_alt: String::new(),
            image_url: String::new(),
        }
    }

    fn record_unsupported(&mut self, element_type: &str) {
        self.unsupported_elements.push(UnsupportedElement::new(element_type));
    }
}

pub fn process_markdown(markdown: &str, mode: UnsupportedMode) -> Result<ProcessorState, napi::Error> {
    let mut options = Options::empty();
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TABLES);

    let parser = Parser::new_ext(markdown, options);
    let mut state = ProcessorState::new(mode);

    for event in parser {
        process_event(&mut state, event)?;
    }

    // Clean up excessive newlines
    let re = regex::Regex::new(r"\n{3,}").unwrap();
    state.output = re.replace_all(&state.output, "\n\n").trim().to_string();

    Ok(state)
}

fn process_event(state: &mut ProcessorState, event: Event) -> Result<(), napi::Error> {
    match event {
        Event::Start(tag) => process_start_tag(state, tag),
        Event::End(tag) => process_end_tag(state, tag),
        Event::Text(text) => {
            if state.in_heading {
                state.heading_text.push_str(&text);
            } else if state.in_link {
                state.link_text.push_str(&text);
            } else if state.in_image {
                state.image_alt.push_str(&text);
            } else {
                state.output.push_str(&text);
            }
            Ok(())
        }
        Event::Code(code) => {
            state.output.push_str("```");
            state.output.push_str(&code);
            state.output.push_str("```");
            Ok(())
        }
        Event::SoftBreak => {
            state.output.push('\n');
            Ok(())
        }
        Event::HardBreak => {
            state.output.push('\n');
            Ok(())
        }
        Event::Rule => {
            handle_unsupported(state, "thematicBreak", None)?;
            Ok(())
        }
        Event::Html(html) => {
            handle_unsupported(state, "html", Some(&html))?;
            Ok(())
        }
        _ => Ok(()),
    }
}

fn process_start_tag(state: &mut ProcessorState, tag: Tag) -> Result<(), napi::Error> {
    match tag {
        Tag::Paragraph => {}
        Tag::Strong => {
            state.output.push('*');
        }
        Tag::Emphasis => {
            state.output.push('_');
        }
        Tag::Strikethrough => {
            state.output.push('~');
        }
        Tag::CodeBlock(_) => {
            state.output.push_str("```");
        }
        Tag::List(start) => {
            state.list_stack.push(start);
        }
        Tag::Item => {
            if let Some(start) = state.list_stack.last() {
                match start {
                    Some(n) => {
                        let index = state.list_stack.iter()
                            .filter(|s| s.is_some())
                            .count();
                        state.output.push_str(&format!("{}. ", n + index as u64 - 1));
                    }
                    None => {
                        state.output.push_str("- ");
                    }
                }
            }
        }
        Tag::BlockQuote(_) => {
            state.output.push_str("> ");
        }
        Tag::Heading { .. } => {
            handle_unsupported(state, "heading", None)?;
            state.in_heading = true;
            state.heading_text.clear();
        }
        Tag::Link { dest_url, .. } => {
            handle_unsupported(state, "link", None)?;
            state.in_link = true;
            state.link_text.clear();
            state.link_url = dest_url.to_string();
        }
        Tag::Image { dest_url, .. } => {
            handle_unsupported(state, "image", None)?;
            state.in_image = true;
            state.image_alt.clear();
            state.image_url = dest_url.to_string();
        }
        Tag::Table(_) => {
            handle_unsupported(state, "table", None)?;
        }
        _ => {}
    }
    Ok(())
}

fn process_end_tag(state: &mut ProcessorState, tag: TagEnd) -> Result<(), napi::Error> {
    match tag {
        TagEnd::Paragraph => {
            state.output.push_str("\n\n");
        }
        TagEnd::Strong => {
            state.output.push('*');
        }
        TagEnd::Emphasis => {
            state.output.push('_');
        }
        TagEnd::Strikethrough => {
            state.output.push('~');
        }
        TagEnd::CodeBlock => {
            state.output.push_str("```\n\n");
        }
        TagEnd::List(_) => {
            state.list_stack.pop();
            state.output.push_str("\n\n");
        }
        TagEnd::Item => {
            state.output.push('\n');
        }
        TagEnd::BlockQuote(_) => {
            state.output.push_str("\n\n");
        }
        TagEnd::Heading(_) => {
            state.in_heading = false;
            // Convert heading to bold in warn mode
            if state.mode == UnsupportedMode::Warn {
                state.output.push('*');
                state.output.push_str(&state.heading_text);
                state.output.push_str("*\n\n");
            } else if state.mode == UnsupportedMode::Ignore {
                state.output.push_str(&state.heading_text);
                state.output.push_str("\n\n");
            }
            state.heading_text.clear();
        }
        TagEnd::Link => {
            state.in_link = false;
            // Convert link to "text (url)" in warn mode
            if state.mode == UnsupportedMode::Warn {
                state.output.push_str(&state.link_text);
                state.output.push_str(" (");
                state.output.push_str(&state.link_url);
                state.output.push(')');
            } else if state.mode == UnsupportedMode::Ignore {
                state.output.push_str(&state.link_text);
            }
            state.link_text.clear();
            state.link_url.clear();
        }
        TagEnd::Image => {
            state.in_image = false;
            // Convert image to "alt: url" in warn mode
            if state.mode == UnsupportedMode::Warn {
                if !state.image_alt.is_empty() {
                    state.output.push_str(&state.image_alt);
                    state.output.push_str(": ");
                }
                state.output.push_str(&state.image_url);
            } else if state.mode == UnsupportedMode::Ignore {
                state.output.push_str(&state.image_url);
            }
            state.image_alt.clear();
            state.image_url.clear();
        }
        _ => {}
    }
    Ok(())
}

fn handle_unsupported(state: &mut ProcessorState, element_type: &str, value: Option<&str>) -> Result<(), napi::Error> {
    match state.mode {
        UnsupportedMode::Strict => {
            return Err(unsupported_element_error(element_type));
        }
        UnsupportedMode::Strip => {
            state.record_unsupported(element_type);
        }
        UnsupportedMode::Warn => {
            state.record_unsupported(element_type);
            // Graceful conversion handled in tag processing
        }
        UnsupportedMode::Ignore => {
            state.record_unsupported(element_type);
            if let Some(v) = value {
                state.output.push_str(v);
            }
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bold() {
        let result = process_markdown("**bold**", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "*bold*");
    }

    #[test]
    fn test_italic() {
        let result = process_markdown("*italic*", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "_italic_");
    }

    #[test]
    fn test_strikethrough() {
        let result = process_markdown("~~strikethrough~~", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "~strikethrough~");
    }

    #[test]
    fn test_inline_code() {
        let result = process_markdown("`code`", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "```code```");
    }

    #[test]
    fn test_heading_warn() {
        let result = process_markdown("# Header", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "*Header*");
        assert_eq!(result.unsupported_elements.len(), 1);
    }

    #[test]
    fn test_heading_strict() {
        let result = process_markdown("# Header", UnsupportedMode::Strict);
        assert!(result.is_err());
    }

    #[test]
    fn test_link_warn() {
        let result = process_markdown("[click](https://example.com)", UnsupportedMode::Warn).unwrap();
        assert_eq!(result.output, "click (https://example.com)");
    }
}
