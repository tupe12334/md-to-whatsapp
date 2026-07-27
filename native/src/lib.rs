#![deny(clippy::all)]
#![deny(clippy::unwrap_used)]

mod errors;
mod processor;
mod types;

use napi_derive::napi;
use types::{ConvertOptions, ConvertResult, UnsupportedMode};
use processor::process_markdown;

#[napi]
pub fn convert(markdown: String, options: Option<ConvertOptions>) -> napi::Result<ConvertResult> {
    let mode = options
        .and_then(|o| o.unsupported_mode)
        .unwrap_or(UnsupportedMode::Warn);

    let state = process_markdown(&markdown, mode)?;

    Ok(ConvertResult {
        text: state.output,
        unsupported_elements: state.unsupported_elements,
    })
}

#[napi]
pub fn convert_to_string(markdown: String, options: Option<ConvertOptions>) -> napi::Result<String> {
    let result = convert(markdown, options)?;
    Ok(result.text)
}
