<script>
  import NewRoom from "../NewRoom.svelte";
  import RoomList from "../RoomList.svelte";
</script>

<div class="layout">
  <h1>Místnosti</h1>
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
