<script lang="ts">
  import type { Socket } from "socket.io-client";
  import type * as types from "semiaserver/dist/types";
  import { getContext } from "svelte";
  import InviteRoomMember from "./InviteRoomMember.svelte";

  const roomSocket: Socket = getContext("roomSocket");
  let members = [];

  roomSocket.emit(
    "room:memberList",
    (response: types.RoomListMembersResponse) => {
      if ("result" in response) {
        members = response.result;
      }
    }
  );

  roomSocket.on("room:newMember", (message: types.RoomNewMemberMessage) => {
    members = [message.user, ...members];
  });
</script>

<h2>Invite</h2>
<InviteRoomMember />

<h2>Members</h2>
<ul>
  {#each members as member}
    <li>
      {member.email}
    </li>
  {/each}
</ul>
