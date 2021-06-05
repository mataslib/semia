<script lang="ts">
  /**
   * Chat component
   */
  import { getContext, tick, onMount } from "svelte";
  import type * as types from "semiaserver/dist/types";
  import type { Socket } from "socket.io-client";
  import { server } from "../shared/globals";

  const roomSocket: Socket = getContext("roomSocket");

  let messages = [];
  let createMessageError: string = "";
  let roomMessagesError: string = "";
  let msgsEl: HTMLDivElement;

  onMount(() => {
    // fetch existing chat history
    roomSocket.emit("room:messages", (response: types.RoomMessagesResponse) => {
      if ("result" in response) {
        messages = response.result;
      } else {
        roomMessagesError = response.error.message;
      }
    });
    // add message on new chat message and scroll to chat bottom 
    roomSocket.on(
      "room:newMessage",
      async (message: types.NewMessageMessage) => {
        console.log("room:newMessage", message);
        messages = [...messages, message.message];
        await tick();
        msgsEl.scrollTop = msgsEl.scrollHeight;
      }
    );
  });

  let formEl: HTMLFormElement;
  let messageEl: HTMLTextAreaElement;
  let fileEl: HTMLInputElement;
  async function sendMessage(e) {
    if (!messageEl.value && !fileEl.value) {
      return;
    }

    // create file request when form contains file
    let fileReq = {};
    if (fileEl.value) {
      const reader = new FileReader();
      const file: ArrayBuffer = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result as ArrayBuffer);
        reader.readAsArrayBuffer(fileEl.files[0]);
      });
      fileReq = {
        file: {
          data: file,
          name: fileEl.files[0].name,
          extension: fileEl.files[0].name.substring(
            fileEl.files[0].name.lastIndexOf(".") + 1
          ),
        },
      };
    }

    // create message request
    const createMessageReq: types.RoomCreateMessageReq = {
      ...{
        message: messageEl.value,
      },
      ...fileReq,
    };

    // communicate with server
    roomSocket.emit(
      "room:createMessage",
      createMessageReq,
      (response: types.RoomCreateMessageRes) => {
        if ("result" in response) {
          formEl.reset();
        } else {
          createMessageError = response.error.message;
        }
      }
    );
  }
</script>

<div class="chat">
  <div class="msgs" bind:this={msgsEl}>
    {#each messages as message (message._id)}
      <div class="msg">
        <div class="msg-header">
          {message.userName}
          {new Date(message.createdAt).toLocaleString()}<br />
        </div>
        <div class="msg-body">
          {message.message}
          {#if message.file}
            <a target="_blank" href={`http://${server}/${message.file.path}`}
              >{message.file.name}</a
            >
          {/if}
        </div>
      </div>
    {/each}
    {roomMessagesError}
  </div>
</div>

<div class="chatform-container">
  <form
    class="chatform"
    bind:this={formEl}
    on:submit|preventDefault={sendMessage}
  >
    <textarea bind:this={messageEl} />
    <input bind:this={fileEl} type="file" />
    <button>Send</button>
    <div>{createMessageError}</div>
  </form>
</div>

<style>
  .chatform-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  .chatform {
    display: grid;
    grid-auto-flow: row;
    row-gap: 15px;
    margin: 15px 0;
  }

  .chat {
    display: inline-flex;
    flex-direction: column;
    column-gap: 20px;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    overflow: auto;
    border: 1px solid black;
  }

  .msgs {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    margin-left: auto;
    flex: 1 1 0%;
    overflow: auto;
    width: 100%;
    padding: 15px;
  }

  .msg-header {
    color: gray;
  }

  .msg-body {
    background-color: rgb(0, 132, 255);
    color: white;
    padding: 8px 12px;
    border-radius: 18px;
    display: inline-block;
  }
</style>
