"use client";

import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import TemplateFileTree from '@/features/playground/components/template-file-tree';
import { useFileExplorer } from '@/features/playground/hooks/useFileExplorer';
import { usePlayground } from '@/features/playground/hooks/usePlayground';
import { TemplateFile, TemplateFolder } from '@/features/playground/types';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react'

const Page = () => {
    const { id } = useParams<{ id: string }>();
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

    return (
        <div>
            <>
                <TemplateFileTree
                    data={templateData!}
                />

                <SidebarInset>
                    <header className="flex items-center h-16 gap-2 px-4 border-b shrink-0">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4 mr-2" />
                        <div className="flex items-center flex-1 gap-2">
                            <div className="flex flex-col flex-1">
                                {playgroundData?.title || "Code Playground"}
                            </div>
                        </div>
                    </header>
                </SidebarInset>
            </>
        </div>
    )
}

export default Page