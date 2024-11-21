import { useCallback, useEffect, useRef, useState } from "react";

import * as monaco from "monaco-editor";
import { PGlite, Results as PgliteResults } from "@electric-sql/pglite";
const db = new PGlite();

const initQuery = `CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
INSERT INTO users (name) VALUES ('Alice');
`;

const initialValue = `-- CREATE TABLE IF NOT EXISTS users (
--  id SERIAL PRIMARY KEY,
--  name TEXT NOT NULL
-- );
-- INSERT INTO users (name) VALUES ('Alice');
SELECT * from users;
`;
function useEditor(
  ref: React.RefObject<HTMLDivElement>,
  onRun: (query: string) => void
) {
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const _editor = monaco.editor.create(ref.current, {
      value: initialValue,
      language: "sql",
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
    });
    const observer = new ResizeObserver((_entries) => {
      _editor.layout({
        width: ref.current?.clientWidth!,
        height: ref.current?.clientHeight!,
      });
    });
    observer.observe(ref.current);
    // _editor.addCommand(
    //   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
    //   async () => {
    //     const query = _editor.getValue();

    //     if (!query) return;
    //     try {

    //       const result = await db.query(query);
    //       console.log(result);
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   }
    // );
    editor.current = _editor;
    return () => {
      _editor.dispose();
      observer.disconnect();
    };
  }, [ref.current]);

  useEffect(() => {
    if (!ref.current) return;
    if (!editor.current) return;
    editor.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR,
      async () => {
        const query = editor.current!.getValue();
        onRun(query);
      }
    );
    // editor.current = _editor;
    return () => {
      // editor.current!.
      // editor.current!.remove
    };
  }, [editor, onRun]);

  return editor;
}

let initialized = false;
async function initOnce() {
  if (initialized) return;
  initialized = true;
  try {
    await db.exec(initQuery);
    // await db.exec()
    console.log("Table created");
    initialized = true;
  } catch (error) {
    console.error(error);
  }
}

function App() {
  const [results, setResults] = useState<PgliteResults[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const onRun = useCallback(
    (query: string) => {
      console.log("Running", query);
      db.query(query).then((result) => {
        console.log(result);
        setResults([result as PgliteResults, ...results].slice(0, 3));
      });
    },
    [results, setResults]
  );
  const editor = useEditor(ref, onRun);
  // const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (editor.current == null) return;
    editor.current.focus();
    initOnce().catch(console.error);
    return () => {};
  }, [editor.current]);

  return (
    <div
      style={{
        display: "grid",
        height: "100vh",
        width: "100vw",
        gridTemplateColumns: "50% 50%",
        gridTemplateRows: "100%",
        gridTemplateAreas: "'l r'",
      }}
    >
      <div
        style={{ gridArea: "l", width: "100%", height: "100%" }}
        ref={ref}
      ></div>
      <div style={{ gridArea: "r" }}>
        <h1>Run (Ctrl+R)</h1>
        <pre>
          <code>
            {JSON.stringify(
              results.map((x) => x.rows),
              null,
              2
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default App;
