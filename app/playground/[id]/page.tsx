"use client";

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

import TemplateFileTree from '@/features/playground/components/template-file-tree';
import { useFileExplorer } from '@/features/playground/hooks/useFileExplorer';

import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from "sonner";
import {
    FileText,
    FolderOpen,
    AlertCircle,
    Save,
    X,
    Settings,
    Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TemplateFile } from '@/features/playground/types';
import PlaygroundEditor from '@/features/playground/components/playground-editor';
import { useWebContainer } from '@/features/webContainers/hooks/useWebContainer';
import WebContainerPreview from '@/features/webContainers/components/webcontainer-preview';
import LoadingStep from '@/components/ui/loader';

const Page = () => {
    const { id } = useParams<{ id: string }>();
    const [isPreviewVisible, setIsPreviewVisible] = useState(true);
    const { playgroundData, templateData, isLoading, error, saveTemplateData } = usePlayground(id);
    const {
        activeFileId,
        closeAllFiles,
        openFile,
        closeFile,
        editorContent,
        updateFileContent,
        handleAddFile,
        handleAddFolder,
        handleDeleteFile,
        handleDeleteFolder,
        handleRenameFile,
        handleRenameFolder,
        openFiles,
        setTemplateData,
        setActiveFileId,
        setPlaygroundId,
        setOpenFiles,
    } = useFileExplorer();

    const {
        serverUrl,
        isLoading: containerLoading,
        error: containerError,
        instance,
        writeFileSync,
        // @ts-ignore
    } = useWebContainer({ templateData });

    useEffect(() => {
        setPlaygroundId(id);
    }, [id, setPlaygroundId]);

    useEffect(() => {
        if (templateData && !openFiles.length) {
            setTemplateData(templateData);
        }
    }, [templateData, setTemplateData, openFiles.length]);

    const activeFile = openFiles.find((file) => file.id === activeFileId);
    const hasUnsavedChanges = openFiles.some((file) => file.hasUnsavedChanges);

    const handleFileSelect = (file: TemplateFile) => {
        openFile(file);
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <h2 className="mb-2 text-xl font-semibold text-red-600">
                    Something went wrong
                </h2>
                <p className="mb-4 text-gray-600">{error}</p>
                <Button onClick={() => window.location.reload()} variant="destructive">
                    Try Again
                </Button>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-4">
                <div className="w-full max-w-md p-6 border rounded-lg shadow-sm">
                    <h2 className="mb-6 text-xl font-semibold text-center">
                        Loading Playground
                    </h2>
                    <div className="mb-8">
                        <LoadingStep
                            currentStep={1}
                            step={1}
                            label="Loading playground data"
                        />
                        <LoadingStep
                            currentStep={2}
                            step={2}
                            label="Setting up environment"
                        />
                        <LoadingStep currentStep={3} step={3} label="Ready to code" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <>
                <TemplateFileTree
                    data={templateData!}
                    onFileSelect={handleFileSelect}
                    selectedFile={activeFile}
                    title="File Explorer"
                />

                <SidebarInset>
                    <header className="flex items-center h-16 gap-2 px-4 border-b shrink-0">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4 mr-2" />
                        <div className="flex items-center flex-1 gap-2">
                            <div className="flex flex-col flex-1">
                                <h1 className="text-sm font-medium">
                                    {playgroundData?.name || "Code Playground"}
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    {openFiles.length} file(s) open
                                    {hasUnsavedChanges && " • Unsaved changes"}
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => { }}
                                            disabled={!activeFile || !activeFile.hasUnsavedChanges}
                                        >
                                            <Save className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save (Ctrl+S)</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => { }}
                                            disabled={!hasUnsavedChanges}
                                        >
                                            <Save className="w-4 h-4" /> All
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Save All (Ctrl+Shift+S)</TooltipContent>
                                </Tooltip>

                                {/* TODO: TOGGLEAI */}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => { }}
                                            disabled={!hasUnsavedChanges}
                                        >
                                            <Bot className="w-4 h-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Toggle AI</TooltipContent>
                                </Tooltip>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setIsPreviewVisible(!isPreviewVisible)}
                                        >
                                            {isPreviewVisible ? "Hide" : "Show"} Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={closeAllFiles}>
                                            Close All Files
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>

                    <div className="h-[calc(100vh-4rem)]">
                        {openFiles.length > 0 ? (
                            <div className="flex flex-col h-full">
                                {/* File Tabs */}
                                <div className="border-b bg-muted/30">
                                    <Tabs
                                        value={activeFileId || ""}
                                        onValueChange={setActiveFileId}
                                    >
                                        <div className="flex items-center justify-between px-4 py-2">
                                            <TabsList className="h-8 p-0 bg-transparent">
                                                {openFiles.map((file) => (
                                                    <TabsTrigger
                                                        key={file.id}
                                                        value={file.id}
                                                        className="relative h-8 px-3 data-[state=active]:bg-background data-[state=active]:shadow-sm group"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="w-3 h-3" />
                                                            <span>
                                                                {file.filename}.{file.fileExtension}
                                                            </span>
                                                            {file.hasUnsavedChanges && (
                                                                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                                                            )}
                                                            <span
                                                                className="flex items-center justify-center w-4 h-4 ml-2 transition-opacity rounded-sm opacity-0 cursor-pointer hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    closeFile(file.id);
                                                                }}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </span>
                                                        </div>
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {openFiles.length > 1 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={closeAllFiles}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    Close All
                                                </Button>
                                            )}
                                        </div>
                                    </Tabs>
                                </div>

                                {/* Editor and Preview */}
                                <div className="flex-1">
                                    <ResizablePanelGroup
                                        direction="horizontal"
                                        className="h-full"
                                    >
                                        <ResizablePanel defaultSize={isPreviewVisible ? 50 : 100}>
                                            <PlaygroundEditor
                                                activeFile={activeFile}
                                                content={activeFile?.content || ""}
                                                onContentChange={(value) =>
                                                    activeFileId && updateFileContent(activeFileId, value)
                                                }
                                            />
                                        </ResizablePanel>

                                        {isPreviewVisible && (
                                            <>
                                                <ResizableHandle />
                                                <ResizablePanel defaultSize={50}>
                                                    <WebContainerPreview
                                                        templateData={templateData!}
                                                        instance={instance}
                                                        writeFileSync={writeFileSync}
                                                        isLoading={containerLoading}
                                                        error={containerError}
                                                        serverUrl={serverUrl!}
                                                        forceResetup={false}
                                                    />
                                                </ResizablePanel>
                                            </>
                                        )}

                                    </ResizablePanelGroup>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                                <FileText className="w-16 h-16 text-gray-300" />
                                <div className="text-center">
                                    <p className="text-lg font-medium">No files open</p>
                                    <p className="text-sm text-gray-500">
                                        Select a file from the sidebar to start editing
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </SidebarInset>
            </>
        </TooltipProvider>
    )
}

export default Page