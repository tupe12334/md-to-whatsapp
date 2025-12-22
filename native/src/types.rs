use napi_derive::napi;

#[napi(string_enum)]
#[derive(Debug, PartialEq, Eq, Default)]
pub enum UnsupportedMode {
    Strict,
    Strip,
    #[default]
    Warn,
    Ignore,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct Position {
    pub line: u32,
    pub column: u32,
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct UnsupportedElement {
    pub element_type: String,
    pub value: Option<String>,
    pub start: Option<Position>,
    pub end: Option<Position>,
}

impl UnsupportedElement {
    pub fn new(element_type: &str) -> Self {
        Self {
            element_type: element_type.to_string(),
            value: None,
            start: None,
            end: None,
        }
    }

    pub fn with_value(mut self, value: &str) -> Self {
        self.value = Some(value.to_string());
        self
    }
}

#[napi(object)]
#[derive(Debug, Clone)]
pub struct ConvertResult {
    pub text: String,
    pub unsupported_elements: Vec<UnsupportedElement>,
}

#[napi(object)]
#[derive(Debug, Clone, Default)]
pub struct ConvertOptions {
    pub unsupported_mode: Option<UnsupportedMode>,
}
