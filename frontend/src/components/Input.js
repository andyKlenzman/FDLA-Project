import "../App.css";
import axios from "axios";
import { useState } from "react";

function Input() {
  const [eventInput, setEventInput] = useState({
    title: "",
    link: "",
    summary: "",
    author: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventInput({ ...eventInput, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(eventInput);

      const res = await axios.post("http://localhost:4000/", eventInput, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        console.log("Resource updated successfully");
        setEventInput({
          title: "",
          link: "",
          summary: "",
          author: "",
        });
      } else {
        console.error("Failed to update resource");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <h1>Submit Your Event</h1>
        <div>
          <label htmlFor="author">Your Name:</label>
          <input
            type="text"
            id="author"
            name="author"
            value={eventInput.author}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={eventInput.title}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="link">Link:</label>
          <input
            type="link"
            id="link"
            name="link"
            value={eventInput.link}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="summary">Summary:</label>
          <textarea
            id="summary"
            name="summary"
            value={eventInput.summary}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Add Event</button>
      </form>
    </div>
  );
}

export default Input;
