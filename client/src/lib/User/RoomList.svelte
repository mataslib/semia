<script lang="ts">
  import { userSocket } from "../shared/store/store";
  import { Link } from "svelte-navigator";
  import type * as types from "semiaserver/dist/types";

  let rooms: types.Room[] = [];

  const roomListReq: types.RoomListReq = {};
  $userSocket.emit("room:list", roomListReq, (response: types.RoomListResponse) => {
    rooms = response.result;
  });

  $userSocket.on("room:new", (response: types.NewRoomMessage) => {
    rooms = [...rooms, response.room];
  });
</script>

<ul>
  {#each rooms as room (room._id)}
    <li>
      <Link to={`/room/${room._id}`}>
        {room.name}
      </Link>
    </li>
  {/each}
</ul>

<style>
  ul {
    padding: 0;
    /* margin: 0; */
  }
  li {
    list-style: none;
  }
</style>
