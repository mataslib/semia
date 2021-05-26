<script lang="ts">
  import { io } from "socket.io-client";
  import Login from "./lib/Login.svelte";
  import Room from "./lib/Pages/Room.svelte";
  import Index from "./lib/Pages/Index.svelte";
  import Rooms from "./lib/RoomList.svelte";
  import { Router, Link, Route, navigate } from "svelte-navigator";
  import { anonymSocket, userSocket, isAuthenticated } from "./lib/store";
  import Register from "./lib/Register.svelte";
  import Modal from "./lib/Modal.svelte";
  import {logout as storeLogout} from "./lib/store";
  

  function logout() {
    storeLogout();
    navigate('/');
  }

  // anonymousSocket.on("connect", () => {});
  // anonymousSocket.on("connect_error", () => {});
</script>

<main>
  {#if $isAuthenticated}
    <a class="logout" href="" on:click|preventDefault={logout}>odhlásit</a>
    <Router>
      <Route path="/">
        <Index/>      
      </Route>

      <Route path="/room/:id">
        <Room/>
      </Route>
    </Router>
  {:else}
    <Modal isOpen={true}>
      <div class="modalcontent">
        <h1>Login</h1>
        <Login />
      </div>
      <hr>
      <div class="modalcontent">
        <h2>Register</h2>
        <Register/>
      </div>
    </Modal>
  {/if}
</main>

<style>
  .modalcontent {
    padding: 15px;
  }
  .logout {
    position: fixed;
    margin: 8px 30px;
    right: 0;
    top: 0;
    z-index: 9;
  }
  hr {
    border-color: black;
  }

  :global(html, body) {
    font-family: Arial, Helvetica, sans-serif;
  }

  :global(a) {
    color: white;
  }
  :global(*) {
    box-sizing: border-box;
  }
  :global(button:hover) {
    cursor: pointer;
  }
  :global(html, body) {
    margin: 0;
    padding: 0;
    background-color: #2E3440;
    color: #D8DEE9;
  }
  main {
    
  }
</style>
