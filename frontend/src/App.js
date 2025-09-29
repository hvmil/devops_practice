import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:8989/api/items")
      .then((res) => setItems(res.data))
      .catch((err) => console.error(err));
  }, []);

  const addItem = () => {
    if (!newItem) return;
    axios
      .post("http://localhost:8989/api/items", { name: newItem })
      .then((res) => setItems([...items, res.data]))
      .catch((err) => console.error(err));
    setNewItem("");
  };

  const deleteItem = (id) => {
    axios
      .delete(`http://localhost:8989/api/items/${id}`)
      .then(() => {
        setItems(items.filter((item) => item.id !== id));
      })
      .catch((err) => console.error(err));
  };


  const startEdit = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, isEditing: true } : item
      )
    );
  };


  const saveEdit = (id) => {
    const item = items.find((i) => i.id === id);
    axios
      .put(`http://localhost:8989/api/items/${id}`, { name: item.name })
      .then((res) => {
        setItems(
          items.map((i) =>
            i.id === id ? { ...res.data, isEditing: false } : i
          )
        );
      })
      .catch((err) => console.error(err));
  };


  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      deleteItem(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 p-8 flex flex-col items-center">
      {/* Header */}
      <h1 className="text-5xl font-extrabold text-purple-700 mb-6 decoration-pink-500 decoration-4">
        DevOps Practice App 🚀
      </h1>

      {/* Items List */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Items</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 flex justify-between items-center transition-all"
            >
              {item.isEditing ? (
                <input
                  value={item.name}
                  onChange={(e) =>
                    setItems(
                      items.map((i) =>
                        i.id === item.id ? { ...i, name: e.target.value } : i
                      )
                    )
                  }
                  className="border px-2 py-1 rounded"
                />
              ) : (
                <span>{item.name}</span>
              )}
              <div className="flex gap-2">
                {item.isEditing ? (
                  <button
                    onClick={() => saveEdit(item.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(item.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => confirmDelete(item.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Item Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addItem();
        }}
        className="w-full max-w-md flex gap-2"
      >
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="New item"
          className="flex-1 p-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
        />
        <button
          type="submit"
          className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-6 py-3 rounded-xl shadow-md transition-all"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default App;
