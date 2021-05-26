import * as yup from "yup";
import mongodb from 'mongodb'

export interface SuccessResponse {
  result: any
}

export interface ErrorResponse {
  error: {
    message: string
  }
}


export interface UserRegisterMessage
{
  email: string,
  password: string,
}
export interface UserRegisterSuccessResponse extends SuccessResponse
{
  result: true
}
export type UserRegisterResponse =  UserRegisterSuccessResponse | ErrorResponse;
export const userRegisterReqSchema = yup.object().shape({
  email: yup.string()
    .required()
    .email(),
  password: yup.string()
    .required()
    .min(6),
});



export interface AuthSuccessResponse extends SuccessResponse {
  result: {
    token: string
  }
}
export type AuthResponse = AuthSuccessResponse | ErrorResponse;
export interface AuthMessage {
  email: string,
  password: string,
}
export const userAuthReqSchema = yup.object().shape({
  email: yup.string()
    .required()
    .email()
    ,
  password: yup.string()
    .required(),
});

export interface RoomJoinMeetingMessage
{
}
export interface RoomJoinSuccessResponse extends SuccessResponse {
  result: true;
}
export type RoomJoinMeetingResponse = RoomJoinSuccessResponse | ErrorResponse; 
export const joinRoomMeetingReqSchema = yup.object().shape({
});

export interface RoomLeaveMeetingMessage
{
}
export interface RoomLeaveSuccessResponse extends SuccessResponse {
  result: true;
}
export type RoomLeaveMeetingResponse = RoomLeaveSuccessResponse | ErrorResponse; 
export const leaveRoomMeetingReqSchema = yup.object().shape({
});

export interface RoomListMembersSuccessResponse
{
  result: User[]
}
export type RoomListMembersResponse = RoomListMembersSuccessResponse | ErrorResponse;

export interface RoomInviteMemberReq
{
  email: string
}
export interface RoomInviteMemberSuccessResult {
  result: true
}
export type RoomInviteMemberResult = RoomInviteMemberSuccessResult | ErrorResponse;
export const roomInviteMemberReqSchema = yup.object().shape({
  email: yup.string().email().required()
});
export interface RoomNewMemberMessage
{
  user: RoomUser
}

export interface RoomCreateReq
{
  name: string
}
export interface RoomCreateSuccessResponse extends SuccessResponse {
  result: true
}
export type RoomCreateResponse = RoomCreateSuccessResponse | ErrorResponse;
export const roomCreateReqSchema = yup.object().shape({
  name: yup.string()
    .required()
  ,
});
export interface NewRoomMessage {
  room: Room
}


export interface RoomListReq
{
}
export interface RoomListSuccessResponse extends SuccessResponse {
  result: RoomUser[]
}
export type RoomListResponse = RoomListSuccessResponse | ErrorResponse;
export const roomListReqSchema = yup.object().shape({
});

export interface RoomMessagesSuccessResponse extends SuccessResponse {
  result: Message[]
}
export type RoomMessagesResponse = RoomMessagesSuccessResponse | ErrorResponse;

export interface RoomCreateMessageReq {
  message: string,
  file?: {
    data: Buffer,
    extension: string,
    name: string,
  }
}
export interface RoomCreateMessageSuccess extends SuccessResponse {
  result: true
}
export type RoomCreateMessageRes = RoomCreateMessageSuccess | ErrorResponse;
export const roomCreateMessageReqSchema = yup.object().shape({
  message: yup.string().required(),
  file: yup.object({
    data: yup.mixed().test({
      test: (value) => value instanceof Buffer
    }),
    extension: yup.string().required(),
    name: yup.string().required(),
  }).notRequired().default(undefined)
});

export interface NewMessageMessage
{
  message: Message
}


export interface User {
  _id?: mongodb.ObjectID,
  email: string,
  password: string,
  tokens: Token[],
}

export interface Token {
  token: mongodb.ObjectID
}

export interface Message {
  _id?: mongodb.ObjectID,
  createdAt: Date,
  message: string,
  userName: string,
  userRef: mongodb.ObjectID,
  file?: {
    path: string
  }
}

export interface Room {
  _id?: mongodb.ObjectID,
  name: string,
  users: RoomUser[],
  messages: Message[],
}

export type RoomUserRole = 'author' | 'user';
export interface RoomUser {
  userId: mongodb.ObjectID,
  name: string,
  role: RoomUserRole
}
