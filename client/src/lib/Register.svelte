<script lang="ts">
  import Field from "./Field.svelte";
  import { anonymSocket } from "./store";
  import { userRegisterReqSchema } from "semiatypes";
  import type * as types from "semiatypes";
  import * as yup from "yup";
  import PrimaryButton from "./PrimaryButton.svelte";
  import { schemaValidate } from "./schemaValidate";
  import { Sveltik, Form } from "sveltik";

  const initialValues = {
    email: "",
    password: "",
    passwordRepeat: "",
  };

  const validationSchema = userRegisterReqSchema.concat(
    yup.object({
      passwordRepeat: yup
        .string()
        .oneOf([yup.ref("password")], "Passwords must match."),
    })
  );

  const validate = schemaValidate(validationSchema);

  function register(values) {
    const message: types.UserRegisterMessage = {
      email: values.email,
      password: values.password,
    };

    $anonymSocket.emit(
      "user:register",
      message,
      (response: types.UserRegisterResponse) => {
        if ("error" in response) {
          status = response.error.message;
        }

        status = "Ok. Registered.";
      }
    );
  }
</script>

<Sveltik {validate} {initialValues} onSubmit={register} let:props>
  <Form>
    <Field
      label="Email"
      type="email"
      name="email"
      on:input={props.handleInput}
      on:blur={props.handleBlur}
      value={props.values["email"]}
      error={props.errors["email"]}
      touched={props.touched["email"]}
      submitted={props.submitAttemptCount > 0}
    />
    <Field
      label="Heslo"
      type="password"
      name="password"
      on:input={props.handleInput}
      on:blur={props.handleBlur}
      value={props.values["password"]}
      error={props.errors["password"]}
      touched={props.touched["password"]}
      submitted={props.submitAttemptCount > 0}
    />
    <Field
      label="Heslo znovu"
      type="password"
      name="passwordRepeat"
      on:input={props.handleInput}
      on:blur={props.handleBlur}
      value={props.values["passwordRepeat"]}
      error={props.errors["passwordRepeat"]}
      touched={props.touched["passwordRepeat"]}
      submitted={props.submitAttemptCount > 0}
    />
    <PrimaryButton>Registrovat</PrimaryButton>
    {status}
  </Form>
</Sveltik>
