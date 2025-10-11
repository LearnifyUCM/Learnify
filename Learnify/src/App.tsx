import './App.css'
import FileUpload from "./FileUpload.tsx";

function App() {

  return (
    <>
        <div className="flex flex-row">
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
