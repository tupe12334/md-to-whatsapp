use napi::Error;
use napi::Status;

pub fn unsupported_element_error(element_type: &str) -> Error {
    Error::new(
        Status::GenericFailure,
        format!("Unsupported element: {}", element_type),
    )
}
