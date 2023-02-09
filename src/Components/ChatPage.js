import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./ChatPage.css";
import Square from "./Square";
const ENDPOINT = "http://localhost:5000";
var socket;
const ChatPage = () => {
  const [name, setName] = useState("");
  const [roomid, setRoomid] = useState("");
  const [message, setMessage] = useState("");
  const [receivedmessage, setReceivedmessage] = useState([]);
  const [receivedname, setReceivedname] = useState([]);
  //tic tec toe

  const [ticTacToe, setTicTacToe] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [turn, setTurn] = useState("X");
  const [win, setWin] = useState("");
  const [player, setPlayer] = useState("X");
  const [clicked, setClicked] = useState(true);
  const [joinname, setJoinname] = useState("");
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
    });

    socket.on("new game board", (newTicTacToe, turn) => {
      setTicTacToe(newTicTacToe);
      checkForWinner(newTicTacToe);
      setTurn(turn === "X" ? "O" : "X");
    });
    socket.on("show join", (name) => {
      setJoinname((prevjoinname) => [...prevjoinname, name]);
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
    socket.emit("join room", roomid, name);
  };

  const handleClick = (row, col) => {
    const newTicTacToe = [...ticTacToe];
    newTicTacToe[row][col] = turn;
    setTicTacToe(newTicTacToe);

    const id = socket.id;
    socket.emit("game board", { roomid, ticTacToe, turn, id });
    console.log(socket.id);
  };

  function checkForWinner(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        setWin(board[i][0]);
        return board[i][0];
      }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
      if (board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        setWin(board[0][j]);
        return board[0][j];
      }
    }
    // Check diagonals
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      setWin(board[0][0]);
      return board[0][0];
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      setWin(board[0][2]);
      return board[0][2];
    }
    return null;
  }
  const Reset = () => {
    setTicTacToe([
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ]);
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
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
      </div>
      <button onClick={joinRoom}>Join Room</button>
      <button onClick={Reset}>Reset</button>
      <div style={{ display: "grid" }}>
        <div
          style={{
            width: "400px",
            height: "320px",
            display: "flex",
            justifyContent: "center",
            alignItem: "center",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              height: "300px",
              width: "300px",
              position: "absolute",
            }}
          >
            <div id="win">Winner-{win}</div>
            <table style={{ width: "300px", marginTop: "30px" }}>
              <tbody>
                {ticTacToe.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        onClick={() => handleClick(rowIndex, colIndex)}
                        style={{
                          border: "1px solid black",
                          width: "90px",
                          height: "90px",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "35px",
                          color: "brown",
                          textAlign: "center",
                          background: "#7777ae",
                          fontFamily: "cursive",
                        }}
                      >
                        {col}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          style={{
            width: "400px",
            height: "320px",
            borderTop: "1px solid black",
            overflow: "scroll",
          }}
        >
          <div>
            <p> {joinname} joined this Room</p>
            {receivedname.map((elem, index) => (
              <div key={index} className="Messages">
                {elem}-{receivedmessage[index]}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="SendOption">
        <input
          type="text"
          placeholder="Enter your Message.."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
