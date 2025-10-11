import './App.css'
import FileUpload from "./FileUpload.tsx";

function App() {

  return (
    <>
        <div className="min-h-screen flex flex-col items-center justify-start p-12 bg-gray-50">
            <div className="w-full max-w-6xl mb-12">
            <h1  className="text-3xl font-bold mb-2 text-gray-800">
               Learnify
            </h1>
            <p className="text-1xl font-bold mb-8 text-gray-600">
                Upload, read, learn.
            </p>
            </div>

            <FileUpload/>
            <div style={{padding: '2rem'}}>
                <button className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md">
                    Button A
                </button>
            </div>

        </div>


    </>
  )
}

export default App
