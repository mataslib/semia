<script lang="ts">
  /**
   * User register form
   */
  import Field from "../shared/form/Field.svelte";
  import { anonymSocket } from "../shared/store/store";
  import { userRegisterReqSchema } from "semiaserver/dist/types";
  import type * as types from "semiaserver/dist/types";
  import * as yup from "yup";
  import PrimaryButton from "../shared/PrimaryButton.svelte";
  import { schemaValidate } from "../shared/validation/schemaValidate";
  import { Sveltik, Form } from "sveltik";
  import TimedShow from "../shared/TimedShow.svelte";

  let status: string = "";
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
        console.log(response);
        if ("error" in response) {
          status = response.error.message;
        } else {
          status = "Ok. Registered.";
        }
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
      label="Password"
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
      label="Repeat password"
      type="password"
      name="passwordRepeat"
      on:input={props.handleInput}
      on:blur={props.handleBlur}
      value={props.values["passwordRepeat"]}
      error={props.errors["passwordRepeat"]}
      touched={props.touched["passwordRepeat"]}
      submitted={props.submitAttemptCount > 0}
    />
    <PrimaryButton>Register</PrimaryButton>
    <TimedShow bind:value={status}/>
  </Form>
</Sveltik>
