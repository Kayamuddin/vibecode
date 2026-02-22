"use client"

import { useRef, useEffect } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { TemplateFile } from "../types"
import { configureMonaco, defaultEditorOptions, getEditorLanguage } from "../lib/editor-config"

interface PlaygroundEditorProps {
    activeFile: TemplateFile | undefined
    content: string
    onContentChange: (value: string) => void
}

export const PlaygroundEditor = ({
    activeFile,
    content,
    onContentChange,
}: PlaygroundEditorProps) => {
    const editorRef = useRef<any>(null)
    const monacoRef = useRef<Monaco | null>(null)

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor
        monacoRef.current = monaco

        configureMonaco(monaco)

        editor.updateOptions({
            ...defaultEditorOptions,

            // ❌ REMOVE AI BEHAVIOR
            inlineSuggest: { enabled: false },
            suggest: { preview: false },
            quickSuggestions: false,
        })

        updateEditorLanguage()
    }

    const updateEditorLanguage = () => {
        if (!activeFile || !editorRef.current || !monacoRef.current) return
        const language = getEditorLanguage(activeFile.fileExtension || "")
        try {
            monacoRef.current.editor.setModelLanguage(editorRef.current.getModel(), language)
        } catch (e) {
            console.warn("Failed to switch language", e)
        }
    }

    useEffect(() => {
        updateEditorLanguage()
    }, [activeFile])

    return (
        <div className="relative h-full">
            <Editor
                height="100%"
                value={content}
                onChange={(value) => onContentChange(value || "")}
                onMount={handleEditorDidMount}
                language={activeFile ? getEditorLanguage(activeFile.fileExtension || "") : "plaintext"}
                // @ts-ignore
                options={defaultEditorOptions}
            />
        </div>
    )
}