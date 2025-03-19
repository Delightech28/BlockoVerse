import React, { useEffect, useState } from "react";
import { getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, tasksCollection } from "../firebase";
import { toast } from "react-toastify";
import { FaCoins, FaTwitter, FaYoutube, FaInstagram, FaFacebook, FaUserFriends, FaCheckCircle, FaDiscord, FaTelegram, FaReddit, FaArrowLeft  } from "react-icons/fa";
import { BsChevronRight } from "react-icons/bs";
import "./TaskSubmission.css";
import { useNavigate } from "react-router-dom";

const TaskSubmission = () => {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(tasksCollection);
      const taskData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(taskData);
    };

    fetchTasks();
  }, []);

  const handleTaskClick = async (taskId, taskPoints, taskLink) => {
    console.log("🔹 User before completing task:", user);
  
    if (!user) {
      toast.error("You must be logged in to complete tasks.");
      return;
    }
  
    try {
      window.open(taskLink, "_blank");
  
      const userRef = doc(db, "users", user.id);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        toast.error("User data not found.");
        return;
      }
  
      const userData = userSnap.data();
      const updatedPoints = (userData.points || 0) + taskPoints;
      const completedTasks = userData.completedTasks || [];
  
      // Check if task is already completed
      if (completedTasks.includes(taskId)) {
        toast.info("✅ You've already completed this task.");
        return;
      }
  
      console.log(`💰 Adding ${taskPoints} points. New total: ${updatedPoints}`);
  
      // Update Firestore
      await updateDoc(userRef, {
        points: updatedPoints,
        completedTasks: [...completedTasks, taskId], // Add task ID to completedTasks
      });
  
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, completed: true } : task
        )
      );
  
      setUser((prevUser) => ({
        ...prevUser,
        points: updatedPoints,
        completedTasks: [...completedTasks, taskId], // Add to user's completed tasks
      }));
  
      // Store Updated User in LocalStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          points: updatedPoints,
          completedTasks: [...completedTasks, taskId],
        })
      );
  
      toast.success(`✅ Task completed! +${taskPoints} points added.`);
    } catch (error) {
      console.error("❌ Error completing task:", error);
      toast.error("Failed to complete task.");
    }
  };
  
  const getTaskIcon = (type) => {
    switch (type) {
      case "twitter":
        return <FaTwitter size={32} color="#1DA1F2" />;
      case "youtube":
        return <FaYoutube size={32} color="#FF0000" />;
      case "instagram":
        return <FaInstagram size={32} color="#E1306C" />;
      case "facebook":
        return <FaFacebook size={32} color="#1877F2" />;
      case "invite":
        return <FaUserFriends size={32} color="#4CAF50" />;
      case "discord":
        return <FaDiscord size={32} color="#5865F2" />;
      case "telegram":
        return <FaTelegram size={32} color="#0088cc" />;
      case "reddit":
        return <FaReddit size={32} color="#FF4500" />;
      default:
        return null;
    }
  };
   const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="task-container">
           
      <a href="Dashboard" style={{ cursor: "pointer" }} className="back-arrow">
        <FaArrowLeft size={24} />
      </a>
        <h4 className="task-title">📋 Tasks List</h4>

        <div className="toggle-container">
          <span className={!showCompleted ? "active" : ""} onClick={() => setShowCompleted(false)}>
            Not Completed
          </span>
          <div className="toggle-slider" onClick={() => setShowCompleted(!showCompleted)}>
            <div className={`slider-circle ${showCompleted ? "right" : "left"}`}></div>
          </div>
          <span className={showCompleted ? "active" : ""} onClick={() => setShowCompleted(true)}>
            Completed
          </span>
        </div>

        <div className="list-group">
  {showCompleted ? (
    // Show Completed Tasks
    tasks.filter((task) => user?.completedTasks?.includes(task.id)).length === 0 ? (
      <p className="no-tasks-message">🎉 No completed tasks yet!</p>
    ) : (
      tasks
        .filter((task) => user?.completedTasks?.includes(task.id))
        .map((task) => (
          <a key={task.id} href="#" className="task-item done">
            <div className="d-flex align-items-center">
              <div className="task-icon me-3">{getTaskIcon(task.type)}</div>
              <span className="task-text">{task.title}</span>
            </div>

            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center points me-3">
                <FaCoins className="me-1" size={18} />
                <span>+{task.points}</span>
              </div>
              <FaCheckCircle size={20} color="green" />
            </div>
          </a>
        ))
    )
  ) : (
    // Show Not Completed Tasks (Only show "No available tasks" if all tasks are completed)
    tasks.every((task) => user?.completedTasks?.includes(task.id)) ? (
      <p className="no-tasks-message">🚀 No available tasks at the moment!</p>
    ) : (
      tasks
        .filter((task) => !user?.completedTasks?.includes(task.id))
        .map((task) => (
          <a
            key={task.id}
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className="task-item"
            onClick={(e) => {
              e.preventDefault();
              handleTaskClick(task.id, task.points, task.link);
            }}
          >
            <div className="d-flex align-items-center">
              <div className="task-icon me-3">{getTaskIcon(task.type)}</div>
              <span className="task-text">{task.title}</span>
            </div>

            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center points me-3">
                <FaCoins className="me-1" size={18} />
                <span>+{task.points}</span>
              </div>
              <BsChevronRight size={18} color="gray" />
            </div>
          </a>
        ))
    )
  )}
</div>

      </div>
    </div>
  );
};

export default TaskSubmission;