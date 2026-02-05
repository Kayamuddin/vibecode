import EmptyState from "@/components/ui/empty-state";
import AddNewButton from "@/features/dashboard/components/add-new-btn";
import AddRepo from "@/features/dashboard/components/add-repo";

const DashboardMainPage = async () => {
  const playgrounds: any[] = [];
  console.log(playgrounds);
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepo />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState title="No projects found" description="Create a new Project to get started" imageSrc="/empty-state.svg" />
        ) : (
          <p>
            Playground Table
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardMainPage;
