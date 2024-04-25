import { useEffect, useState } from "react";

import axios from "axios";

import MapSelector from "./components/MapSelector";

// axios.defaults.baseURL = "http://localhost:3000/";

function App() {
  const [nodeInfo, setNodeInfo] = useState({});
  const [loading, setLoading] = useState(true);

  const [savedNodes, setSavedNodes] = useState([]);
  const [savedVersions, setSavedVersions] = useState([]);

  useEffect(() => {
    axios.get("node").then((res) => {
      setNodeInfo(res.data);
      setLoading(false);
    });

    axios.get("bridge/nodes").then((res) => {
      setSavedNodes(res.data);
      setLoading(false);
    });

    axios.get("versions").then((res) => {
      setSavedVersions(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col p-5 w-full">
      <div className="border-2 border-violet-600 w-full rounded-lg text-sm p-5 shadow-lg">
        <h1>Dowser</h1>
        <h2>{`NODE: ${nodeInfo.nodeName}`}</h2>
        <h2>{`URL: ${nodeInfo.url}`}</h2>
        <h2>{`VERSION: ${nodeInfo.version}`}</h2>
      </div>

      <div className="grid grid-cols-12 gap-2 mt-2">
        <div className="border-2 border-violet-600 rounded-lg p-5 col-span-8">
          <MapSelector
            selectedCountries={savedNodes.map(
              (node) => node?.doc?.location || null
            )}
          />
        </div>

        <div className="border-2 border-violet-600 rounded-lg p-5 col-span-4">
          <h2 className="text-lg">Saved Nodes</h2>
          {savedNodes.map((node) => {
            return (
              <div
                key={node.id}
                className="border border-violet-600 rounded-lg p-1 mb-2 flex justify-between"
              >
                <div>
                  <h3>{node.doc.nodeName}</h3>
                  <p>{node.doc.url}</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      location.href = node.doc.url;
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-2 border-violet-600 rounded-lg p-5 col-span-8">
          <h2 className="text-lg">Versions</h2>
          {savedVersions.map((node) => {
            console.log(node);
            return (
              <div
                key={node.id}
                className="border border-violet-600 rounded-lg p-1 mb-2"
              >
                <h3>{node.id}</h3>
                {Object.keys(node.doc.files).map((fileId) => {
                  const file = node.doc.files[fileId];
                  return (
                    <div
                      key={fileId}
                      className="border border-violet-600 rounded-lg p-1 mb-2 text-xs"
                    >
                      <h4>{fileId}</h4>
                      <p>{file.name}</p>
                      <p>{file.size}</p>
                      <p>{file.path}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
