<script lang="ts">
  import RoomIndex from "./lib/Pages/RoomIndex.svelte";
  import UserIndex from "./lib/Pages/UserIndex.svelte";
  import { Router, Route, navigate } from "svelte-navigator";
  import { isAuthenticated } from "./lib/shared/store/store";
  import { logout as storeLogout } from "./lib/shared/store/store";
  import AnonymIndex from "./lib/Pages/AnonymIndex.svelte";

  /**
   * Logs out user
   */
  function logout() {
    storeLogout();
    navigate("/");
  }
</script>

<main>
  {#if $isAuthenticated}
    <a class="logout" href="" on:click|preventDefault={logout}>Logout</a>
    <Router>
      <Route path="/">
        <UserIndex />
      </Route>

      <Route path="/room/:id">
        <RoomIndex />
      </Route>
    </Router>
  {:else}
    <AnonymIndex />
  {/if}
</main>

<style>
  .logout {
    position: fixed;
    margin: 8px 30px;
    right: 0;
    top: 0;
    z-index: 9;
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
    background-color: #2e3440;
    color: #d8dee9;
  }
</style>
