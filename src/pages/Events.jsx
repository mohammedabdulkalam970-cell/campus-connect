import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

const categories = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
];

export default function Events() {
  const { isAdmin } = useAuth();

  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  // FETCH EVENTS
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));

      const eventsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // SEARCH + FILTER
  useEffect(() => {
    let filtered = events;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [search, selectedCategory, events]);

  // ADD EVENT
  const handleAddEvent = async () => {
    if (!title || !description || !date || !venue) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        title,
        description,
        category,
        date,
        venue,
        createdBy: auth.currentUser?.email || "Unknown",
      });

      alert("Event Added Successfully");

      setShowModal(false);

      setTitle("");
      setDescription("");
      setCategory("Technical");
      setDate("");
      setVenue("");

      fetchEvents();
    } catch (error) {
      console.log(error);
      alert("Failed to add event");
    }
  };

  // DELETE EVENT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "events", id));

      alert("Event deleted");

      fetchEvents();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Events
          </h1>

          <p className="text-gray-400 mt-3 text-lg">
            College events & activities
          </p>
        </div>

        {/* ADMIN ONLY */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all duration-300 px-6 py-3 rounded-2xl font-bold"
          >
            + Add Event
          </button>
        )}
      </div>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search events..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-[#0f172a] border border-cyan-500/10 rounded-2xl px-5 py-4 mb-8 outline-none"
      />

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap mb-10">

        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-semibold ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                : "bg-[#1e293b]"
            }`}
          >
            {cat}
          </button>
        ))}

      </div>

      {/* EVENTS */}
      {filteredEvents.length === 0 ? (

        <div className="text-center mt-32">
          <h2 className="text-3xl font-bold text-gray-500">
            No events found
          </h2>
        </div>

      ) : (

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {filteredEvents.map((event) => (

            <div
              key={event.id}
              className="bg-[#0f172a] border border-cyan-500/10 rounded-3xl p-6 relative"
            >

              {/* DELETE BUTTON */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(event.id)}
                  className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg"
                >
                  Delete
                </button>
              )}

              {/* ADMIN BADGE */}
              {event.createdBy === "admin@necn.ac.in" && (
                <div className="mb-4 inline-block bg-yellow-400 text-black text-xs font-bold px-4 py-1 rounded-full">
                  ADMIN EVENT
                </div>
              )}

              <h2 className="text-3xl font-black mb-3">
                {event.title}
              </h2>

              <p className="text-gray-400 mb-5">
                {event.description}
              </p>

              <div className="mb-4">
                <span className="bg-blue-600 px-4 py-1 rounded-full text-sm">
                  {event.category}
                </span>
              </div>

              <p className="mb-2">📅 {event.date}</p>

              <p className="mb-4">📍 {event.venue}</p>

              <p className="text-xs text-gray-500">
                Posted by: {event.createdBy}
              </p>

            </div>

          ))}

        </div>

      )}

      {/* MODAL */}
      {showModal && (

        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">

          <div className="bg-[#0f172a] p-8 rounded-3xl w-full max-w-xl">

            <h2 className="text-4xl font-black mb-8">
              Add Event
            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Event title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1e293b] p-4 rounded-xl outline-none"
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1e293b] p-4 rounded-xl outline-none h-32"
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#1e293b] p-4 rounded-xl outline-none"
              >
                <option>Technical</option>
                <option>Cultural</option>
                <option>Sports</option>
                <option>Workshop</option>
                <option>Seminar</option>
              </select>

              <input
                type="text"
                placeholder="Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#1e293b] p-4 rounded-xl outline-none"
              />

              <input
                type="text"
                placeholder="Venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-[#1e293b] p-4 rounded-xl outline-none"
              />

              <div className="flex gap-4 pt-4">

                <button
                  onClick={handleAddEvent}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold"
                >
                  Add Event
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-4 rounded-xl font-bold"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}