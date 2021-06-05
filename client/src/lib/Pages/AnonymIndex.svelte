<script>
  /**
   * Anonymous user index page 
  */
  import Login from "../Anonym/Login.svelte";
  import Register from "../Anonym/Register.svelte";
  import Modal from "../shared/Modal.svelte";
</script>

<Modal isOpen={true}>
  <div class="modalcontent">
    <h1>Login</h1>
    <Login />
  </div>
  <hr />
  <div class="modalcontent">
    <h2>Register</h2>
    <Register />
  </div>
</Modal>

<style>
  .modalcontent {
    padding: 15px;
  }
  hr {
    border-color: black;
  }
</style>
