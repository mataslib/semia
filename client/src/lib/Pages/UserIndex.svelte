<script>
  import NewRoom from "../User/NewRoom.svelte";
  import RoomList from "../User/RoomList.svelte";
</script>

<div class="layout">
  <h1>Rooms</h1>
  <RoomList />
  <NewRoom />
</div>

<style>
  .layout {
    display: grid;
    justify-content: center;
    text-align: center;
  }
</style>
