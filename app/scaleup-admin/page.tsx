"use client";

import { useState, useEffect } from "react";

const PASSWORD = "scalemeup";

export default function AdminPage() {

  const [logged, setLogged] = useState(false);
  const [pass, setPass] = useState("");

  const [speakers, setSpeakers] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editPartnerIndex, setEditPartnerIndex] = useState<number | null>(null);

  const [speakerForm, setSpeakerForm] = useState({
    name: "",
    role: "",
    image: "",
  });

  const [partnerForm, setPartnerForm] = useState({
    logo: "",
  });

  // Convert Google Drive link → image
  const convertDriveLink = (url: string) => {

    const match = url.match(/\/d\/(.*?)\//);

    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

    return url;

  };

  useEffect(() => {

    const savedSpeakers = localStorage.getItem("speakers");
    const savedPartners = localStorage.getItem("partners");

    if (savedSpeakers) setSpeakers(JSON.parse(savedSpeakers));
    if (savedPartners) setPartners(JSON.parse(savedPartners));

  }, []);

  const login = () => {

    if (pass === PASSWORD) setLogged(true);
    else alert("Wrong password");

  };

  // ADD / UPDATE SPEAKER
  const addSpeaker = () => {

    const image = convertDriveLink(speakerForm.image);

    const newSpeaker = {
      name: speakerForm.name,
      role: speakerForm.role,
      image,
    };

    let updated;

    if (editIndex !== null) {

      updated = [...speakers];
      updated[editIndex] = newSpeaker;
      setEditIndex(null);

    } else {

      updated = [...speakers, newSpeaker];

    }

    setSpeakers(updated);
    localStorage.setItem("speakers", JSON.stringify(updated));

    setSpeakerForm({
      name: "",
      role: "",
      image: "",
    });

  };

  const deleteSpeaker = (index: number) => {

    const updated = speakers.filter((_, i) => i !== index);

    setSpeakers(updated);
    localStorage.setItem("speakers", JSON.stringify(updated));

  };

  const editSpeaker = (index: number) => {

    const speaker = speakers[index];

    setSpeakerForm({
      name: speaker.name,
      role: speaker.role,
      image: speaker.image,
    });

    setEditIndex(index);

  };

  // ADD / UPDATE PARTNER
  const addPartner = () => {

    const logo = convertDriveLink(partnerForm.logo);

    let updated;

    if (editPartnerIndex !== null) {

      updated = [...partners];
      updated[editPartnerIndex] = { logo };
      setEditPartnerIndex(null);

    } else {

      updated = [...partners, { logo }];

    }

    setPartners(updated);
    localStorage.setItem("partners", JSON.stringify(updated));

    setPartnerForm({ logo: "" });

  };

  const deletePartner = (index: number) => {

    const updated = partners.filter((_, i) => i !== index);

    setPartners(updated);
    localStorage.setItem("partners", JSON.stringify(updated));

  };

  const editPartner = (index: number) => {

    const partner = partners[index];

    setPartnerForm({
      logo: partner.logo,
    });

    setEditPartnerIndex(index);

  };

  if (!logged) {

    return (

      <div className="flex h-screen items-center justify-center">

        <div className="p-10 border rounded-xl shadow">

          <h1 className="text-2xl font-bold mb-4">
            Admin Login
          </h1>

          <input
            type="password"
            placeholder="Enter password"
            className="border px-4 py-2 w-full mb-3"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button
            onClick={login}
            className="bg-black text-white px-6 py-2 rounded"
          >
            Login
          </button>

        </div>

      </div>

    );

  }

  return (

    <div className="p-10 max-w-6xl mx-auto space-y-12">

      <h1 className="text-3xl font-bold">
        ScaleUp Admin Dashboard
      </h1>

      {/* SPEAKER FORM */}

      <div className="border p-6 rounded-xl">

        <h2 className="text-xl font-semibold mb-4">
          {editIndex !== null ? "Edit Speaker" : "Add Speaker"}
        </h2>

        <input
          placeholder="Name"
          className="border p-2 w-full mb-2"
          value={speakerForm.name}
          onChange={(e) =>
            setSpeakerForm({ ...speakerForm, name: e.target.value })
          }
        />

        <input
          placeholder="Role"
          className="border p-2 w-full mb-2"
          value={speakerForm.role}
          onChange={(e) =>
            setSpeakerForm({ ...speakerForm, role: e.target.value })
          }
        />

        <input
          placeholder="Google Drive Image Link"
          className="border p-2 w-full mb-4"
          value={speakerForm.image}
          onChange={(e) =>
            setSpeakerForm({ ...speakerForm, image: e.target.value })
          }
        />

        <button
          onClick={addSpeaker}
          className="bg-green-600 text-white px-6 py-2 rounded"
        >
          {editIndex !== null ? "Update Speaker" : "Add Speaker"}
        </button>

      </div>

      {/* SPEAKERS */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Speakers
        </h2>

        <div className="grid grid-cols-3 gap-6">

          {speakers.map((s, i) => (

            <div key={i} className="border rounded-xl p-4">

              <img
                src={s.image}
                referrerPolicy="no-referrer"
                className="w-full h-40 object-cover rounded mb-3"
              />

              <h3 className="font-semibold">
                {s.name}
              </h3>

              <p className="text-sm text-gray-500">
                {s.role}
              </p>

              <div className="flex gap-2 mt-3">

                <button
                  onClick={() => editSpeaker(i)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteSpeaker(i)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* PARTNER FORM */}

      <div className="border p-6 rounded-xl">

        <h2 className="text-xl font-semibold mb-4">
          {editPartnerIndex !== null ? "Edit Partner" : "Add Partner"}
        </h2>

        <input
          placeholder="Google Drive Logo Link"
          className="border p-2 w-full mb-4"
          value={partnerForm.logo}
          onChange={(e) =>
            setPartnerForm({ ...partnerForm, logo: e.target.value })
          }
        />

        <button
          onClick={addPartner}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {editPartnerIndex !== null ? "Update Partner" : "Add Partner"}
        </button>

      </div>

      {/* PARTNERS */}

      <div>

        <h2 className="text-xl font-semibold mb-4">
          Partners
        </h2>

        <div className="grid grid-cols-4 gap-6">

          {partners.map((p, i) => (

            <div key={i} className="border p-4 rounded-xl">

              <img
                src={p.logo}
                referrerPolicy="no-referrer"
                className="h-20 object-contain mx-auto mb-3"
              />

              <div className="flex gap-2">

                <button
                  onClick={() => editPartner(i)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded w-full"
                >
                  Edit
                </button>

                <button
                  onClick={() => deletePartner(i)}
                  className="bg-red-500 text-white px-3 py-1 rounded w-full"
                >
                  Delete
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}