import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import "./App.css";
import "./ChatPage.css";
const socket = io.connect("https://video-chat-tictectoe.onrender.com");
function VideoChat() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState({});
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  //tic tec toe

  const [ticTacToe, setTicTacToe] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]);
  const [turn, setTurn] = useState("X");
  const [win, setWin] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });
    socket.on("new game board", (newTicTacToe, turn) => {
      setTicTacToe(newTicTacToe);
      checkForWinner(newTicTacToe);
      setTurn(turn === "X" ? "O" : "X");
    });
    socket.on("new game board1", (newTicTacToe, turn) => {
      setTicTacToe(newTicTacToe);
      checkForWinner(newTicTacToe);
      setTurn(turn === "X" ? "O" : "X");
    });
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller, myid: me });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  //tic tec toe

  const handleClick = (row, col) => {
    const newTicTacToe = [...ticTacToe];
    newTicTacToe[row][col] = turn;
    setTicTacToe(newTicTacToe);
    socket.emit("game board", { idToCall, ticTacToe, turn });
    socket.emit("game board1", { me, ticTacToe, turn });
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
    <>
      <h1 style={{ textAlign: "center", color: "#fff", margin: "0" }}>Rana</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{
                  width: "100px",
                  height: "130px",
                  position: "absolute",
                }}
              />
            )}
          </div>
          <div>
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <h1>{name} is calling...</h1>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={answerCall}
                >
                  Answer
                </Button>
              </div>
            ) : null}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "300px" ,height:"225px"}}
              />
            ) : null}
          </div>
        </div>
        <div className="call-button">
          {callAccepted && !callEnded ? (
            <div>
              <Button
                variant="contained"
                color="secondary"
                onClick={leaveCall}
                style={{ margin: "5px" }}
              >
                End Call
              </Button>

              <div id="win">Winner-{win}</div>
              <Button variant="contained" color="secondary" onClick={Reset}>
                Reset
              </Button>
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
          ) : (
            <div></div>
          )}
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIcon fontSize="large" />}
            >
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField
            id="filled-basic"
            label="ID to Play"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          {callAccepted && !callEnded ? (
            <div></div>
          ) : (
            <div>
              <IconButton
                color="white"
                aria-label="call"
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize="large" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VideoChat;
