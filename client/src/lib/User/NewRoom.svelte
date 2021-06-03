<script lang="ts">
  import { userSocket } from "../shared/store/store";
  import type * as types from "semiaserver/dist/types";
  import * as typesOther from "semiaserver/dist/types";
  import { Sveltik, Form } from "sveltik";
  import PrimaryButton from "../shared/PrimaryButton.svelte";
  import { schemaValidate } from "../shared/validation/schemaValidate";
  import Field from "../shared/form/Field.svelte";
  import TimedShow from "../shared/TimedShow.svelte";

  const initialValues = {
    name: "",
  };
  const validate = schemaValidate(typesOther.roomCreateReqSchema);

  let status: string = "";
  function createRoom(values) {
    const request: types.RoomCreateReq = {
      name: values["name"],
    };
    $userSocket.emit(
      "room:create",
      request,
      (response: types.RoomCreateResponse) => {
        if ("error" in response) {
          status = response.error.message;
        }

        status = "Ok. Created.";
        setTimeout(() => (status = ""), 3000);
      }
    );
  }
</script>

<Sveltik {validate} {initialValues} onSubmit={createRoom} let:props>
  <Form>
    <Field
      name="name"
      on:input={props.handleInput}
      on:blur={props.handleBlur}
      value={props.values["name"]}
      error={props.errors["name"]}
      touched={props.touched["name"]}
      submitted={props.submitAttemptCount > 0}
    />
    <PrimaryButton>Create Room</PrimaryButton>
    <br />
    <br />
    <div>
      <TimedShow bind:value={status} />
    </div>
  </Form>
</Sveltik>
