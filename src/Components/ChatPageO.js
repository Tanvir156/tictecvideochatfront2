import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./ChatPage.css";
const ENDPOINT = "http://localhost:5000";
var socket;
const ChatPage = () => {
  const [name, setName] = useState("");
  const [roomid, setRoomid] = useState("");
  const [message, setMessage] = useState("");
  const [receivedmessage, setReceivedmessage] = useState([]);
  const [receivedname, setReceivedname] = useState([]);
  useEffect(() => {
    socket = io(ENDPOINT);
    // socket.on("received message", (message) => {
    //   setReceivedmessage(message);
    // });
    socket.on("received privateMessage", (name, message) => {
      setReceivedname((prevreceivedname) => [...prevreceivedname, name]);
      setReceivedmessage((prevreceivedmessage) => [
        ...prevreceivedmessage,
        message,
      ]);
      console.log(receivedname);
      console.log(receivedmessage);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
  const sendMessage = () => {
    if (roomid === "") {
      socket.emit("send message", message);
    } else {
      socket.emit("send privateMessage", { message, roomid, name });
      setMessage("");
    }
  };
  const joinRoom = () => {
    socket.emit("join room", roomid);
  };
  //

  return (
    <div>
      <input
        type="text"
        placeholder="Enter your Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="text"
        placeholder="Enter roomid"
        value={roomid}
        onChange={(event) => setRoomid(event.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>
      <div>
        <div>
          <div
            style={{
              width: "400px",
              height: "600px",
              border: "1px solid black",
            }}
          >
            <input
              type="text"
              placeholder="Enter your Message.."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <div>
              {receivedname.map((elem, index) => (
                <div key={index}>
                  {elem}:{receivedmessage[index]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
