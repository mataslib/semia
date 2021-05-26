<script lang="ts">
  import { getContext, tick, onMount } from "svelte";
  import type * as types from "semiatypes";
  import type { Socket } from "socket.io-client";

  const roomSocket: Socket = getContext('roomSocket');

  let messages = [];
  let createMessageError: string = '';
  let roomMessagesError: string = '';
  let msgsEl: HTMLDivElement;

  onMount(() => {
    roomSocket.emit("room:messages", (response: types.RoomMessagesResponse) => {
      if ("result" in response) {
        messages = response.result;
      } else {
        roomMessagesError = response.error.message;
      }
    });

    roomSocket.on("room:newMessage", async (message: types.NewMessageMessage) => {
      console.log("room:newMessage", message);
      messages = [...messages, message.message];
      await tick();
      msgsEl.scrollTop = msgsEl.scrollHeight;
    });
  });

  let formEl: HTMLFormElement;
  let messageEl: HTMLTextAreaElement;
  let fileEl: HTMLInputElement;
  async function sendMessage(e) {
    if (!messageEl.value && !fileEl.value) {
      return;
    }

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

    const createMessageReq: types.RoomCreateMessageReq = {
      ...{
        message: messageEl.value,
      },
      ...fileReq,
    };

    roomSocket.emit("room:createMessage", createMessageReq, (response: types.RoomCreateMessageRes) => {
      if ('result' in response) {
        formEl.reset();        
      } else {
        createMessageError = response.error.message;
      }
    });

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
            <a
              target="_blank"
              href={`http://localhost:8086/${message.file.path}`}
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
  <form class="chatform" bind:this={formEl} on:submit|preventDefault={sendMessage}>
    <textarea bind:this={messageEl} />
    <input bind:this={fileEl} type="file" />
    <button>Poslat</button>
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
