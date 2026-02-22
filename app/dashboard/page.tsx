import EmptyState from "@/components/ui/empty-state";
import { duplicateProjectById, getAllPlaygroundForUser } from "@/features/dashboard/actions";
import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";
import ProjectTable from "@/features/dashboard/components/project-table";
import { deleteProjectById, editProjectById } from "../../features/dashboard/actions";

const DashboardMainPage = async () => {
  const playgrounds = await getAllPlaygroundForUser();
  const formattedProjects = (playgrounds || []).map((p) => ({
    ...p,
    description: p.description ?? "",
    user: {
      ...p.user,
      name: p.user.name ?? "Anonymous",
      image: p.user.image ?? "", // ✅ FIX HERE
    },
  }));

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-10 mx-auto max-w-7xl">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <AddNewButton />
        <AddRepo />
      </div>
      <div className="flex flex-col items-center justify-center w-full mt-10">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState title="No projects found" description="Create a new Project to get started" imageSrc="/empty-state.svg" />
        ) : (
          <ProjectTable
            projects={formattedProjects}
            onDeleteProject={deleteProjectById}
            onUpdateProject={editProjectById}
            onDuplicateProject={duplicateProjectById}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardMainPage;