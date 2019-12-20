import React from 'react';
import ReactJsonPrint from './react-json-print';
import exampleJson from './example.json';

const styleApp = {
  fontFamily: 'sans-serif',
};

const App: React.FC = () => {
  return (
    <div className="App" style={styleApp}>
      <h1>React JSON Print</h1>
      <h2>Limits output to 1 nested nodes</h2>
      <ReactJsonPrint dataObject={exampleJson} depth={1}></ReactJsonPrint>
      <pre>{JSON.stringify(exampleJson, null, ' ')}</pre>
      <h2>Prints all nodes as expanded</h2>
      <ReactJsonPrint expanded dataString={JSON.stringify(exampleJson)}></ReactJsonPrint>
      <pre>{JSON.stringify(exampleJson, null, ' ')}</pre>
      <h2>Uses a JSON string value</h2>
      <ReactJsonPrint dataObject={exampleJson}></ReactJsonPrint>
      <pre>{JSON.stringify(exampleJson, null, ' ')}</pre>
    </div>
  );
}

export default App;
