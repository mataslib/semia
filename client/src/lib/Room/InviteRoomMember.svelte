<script lang="ts">
  /**
   * Invite room member component
   */
  import Field from "../shared/form/Field.svelte";
  import { Sveltik, Form } from "sveltik";
  import * as yup from "yup";
  import type * as types from "semiaserver/dist/types";
  import { schemaValidate } from "../shared/validation/schemaValidate";
  import type { Socket } from "socket.io-client";
  import { getContext } from "svelte";
  import TimedShow from "../shared/TimedShow.svelte";

  const roomSocket: Socket = getContext("roomSocket");

  const initialValues = {
    email: "",
  };

  const validationSchema = yup.object().shape({
    email: yup.string().required().email(),
  });
  const validate = schemaValidate(validationSchema);

  let status: string = "";
  function inviteMember(values) {
    const message: types.RoomInviteMemberReq = {
      email: values["email"],
    };

    roomSocket.emit(
      "room:inviteMember",
      message,
      (response: types.RoomInviteMemberResult) => {
        if ("error" in response) {
          status = response.error.message;
          return;
        }
      }
    );
  }
</script>

<Sveltik {validate} {initialValues} onSubmit={inviteMember} let:props>
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
    <button>Invite</button>
    <TimedShow value={status} />
  </Form>
</Sveltik>
