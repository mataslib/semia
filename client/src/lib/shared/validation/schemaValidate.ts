import * as yup from "yup";

/**
 * Creates function that validates yup validation schema
 * and returns errors object
 */
export function schemaValidate(validationSchema: yup.AnySchema)
{
  return (values) => {
    let errors = {};

    try {
      validationSchema.validateSync(values, {abortEarly: false});
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        error.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
      }
    }

    return errors;
  }
}
