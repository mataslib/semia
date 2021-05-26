<script lang="ts">
  import { userSocket } from "./store";
  import type * as types from "semiatypes";
  import * as typesOther from "semiatypes";
  import { Sveltik, Form } from "sveltik";
  import PrimaryButton from "./PrimaryButton.svelte";
  import { schemaValidate } from "./schemaValidate";
  import Field from "./Field.svelte";

  const initialValues = {
    name: "",
  };
  const validate = schemaValidate(typesOther.roomCreateReqSchema);

  let status: string = '';
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
        setTimeout(() => status = '', 3000);
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
    <PrimaryButton>Vytvořit místnost</PrimaryButton>
    <br/>
    <br/>
    <div>
      {status}
    </div>
  </Form>
</Sveltik>
