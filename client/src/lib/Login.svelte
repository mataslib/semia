<script lang="ts">
  import Field from "./Field.svelte";
  import { anonymSocket, token } from "./store";
  import { Sveltik, Form } from "sveltik";
  import * as yup from "yup";
  import type * as types from "semiatypes";
  import PrimaryButton from "./PrimaryButton.svelte";
  import {schemaValidate} from "./schemaValidate";

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().required().email(),
    password: yup.string().required(),
  });
  const validate = schemaValidate(validationSchema);

  let status: string = "";
  function login(values) {
    const message: types.AuthMessage = {
      email: values["email"],
      password: values["password"],
    };

    $anonymSocket.emit(
      "authentication",
      message,
      (response: types.AuthResponse) => {
        if ("error" in response) {
          status = response.error.message;
          return;
        }

        $token = response.result.token;
        status = "Ok. Logging in...";
      }
    );
  }
</script>

<Sveltik {validate} {initialValues} onSubmit={login} let:props>
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

    <PrimaryButton>Přihlásit</PrimaryButton>
    {status}
  </Form>
</Sveltik>
