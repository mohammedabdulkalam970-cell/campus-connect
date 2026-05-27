import { useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const categories = [
  "All",
  "Technical",
  "Cultural",
  "Sports",
  "Workshop",
  "Seminar",
];

const Events = () => {
  const { userProfile, currentUser } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Technical",
    date: "",
    venue: "",
  });

  const isAdmin = userProfile?.role === "admin";

  // FETCH EVENTS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "events"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEvents(data);
    });

    return () => unsub();
  }, []);

  // ADD EVENT
  const handleAddEvent = async () => {
    if (
      !form.title ||
      !form.description ||
      !form.date ||
      !form.venue
    ) {
      toast.error("Fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "events"), {
        ...form,
        createdBy: currentUser.email,
      });

      toast.success("Event added");

      setForm({
        title: "",
        description: "",
        category: "Technical",
        date: "",
        venue: "",
      });

      setShowModal(false);
    } catch (error) {
      toast.error("Failed to add event");
    }
  };

  // DELETE EVENT
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "events", id));
      toast.success("Event deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // FILTER EVENTS
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 text-white min-h-screen bg-[#020817]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black text-blue-400 mb-2">
            Events
          </h1>

          <p className="text-gray-400 text-lg">
            College events & activities
          </p>
        </div>

        {/* ADMIN BUTTON */}
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 font-bold text-lg hover:scale-105 transition"
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
        className="w-full mb-6 p-4 rounded-2xl bg-[#0f172a] border border-slate-700 outline-none"
      />

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-semibold transition ${
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-slate-800 text-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* EVENTS GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 relative shadow-xl"
          >
            {/* DELETE BUTTON */}
            {isAdmin && (
              <button
                onClick={() => handleDelete(event.id)}
                className="absolute top-4 right-4 bg-red-500 px-3 py-1 rounded-xl text-sm font-bold"
              >
                Delete
              </button>
            )}

            <h2 className="text-4xl font-black mb-3">
              {event.title}
            </h2>

            <p className="text-gray-400 mb-5">
              {event.description}
            </p>

            <span className="inline-block px-4 py-2 bg-blue-600 rounded-full text-sm font-bold mb-4">
              {event.category}
            </span>

            <div className="space-y-2 text-lg">
              <p>📅 {event.date}</p>
              <p>📍 {event.venue}</p>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              Posted by: {event.createdBy}
            </p>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {filteredEvents.length === 0 && (
        <div className="text-center text-gray-500 mt-20 text-2xl">
          No events found
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f172a] p-8 rounded-3xl w-full max-w-lg border border-slate-700">
            <h2 className="text-3xl font-black mb-6">
              Add New Event
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Event title"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700"
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700"
              />

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700"
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
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700"
              />

              <input
                type="text"
                placeholder="Venue"
                value={form.venue}
                onChange={(e) =>
                  setForm({ ...form, venue: e.target.value })
                }
                className="w-full p-4 rounded-xl bg-[#020817] border border-slate-700"
              />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleAddEvent}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-400 font-bold"
              >
                Add Event
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-700 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;