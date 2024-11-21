import { useEffect, useRef } from "react";
import "./App.css";

import * as monaco from "monaco-editor";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const editor = monaco.editor.create(ref.current, {
      value: 'select * from "table_name";',
      language: "sql",
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
    });
    const observer = new ResizeObserver((_entries) => {
      editor.layout({
        width: ref.current?.clientWidth!,
        height: ref.current?.clientHeight!,
      });
    });
    observer.observe(ref.current);
    return () => {
      editor.dispose();
      observer.disconnect();
    };
  }, [ref.current]);

  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }} ref={ref}></div>
    </>
  );
}

export default App;
