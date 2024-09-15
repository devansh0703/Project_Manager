-- CreateTable
CREATE TABLE "comment_projects" (
    "comment_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "comment_projects_pkey" PRIMARY KEY ("comment_id","project_id")
);

-- CreateTable
CREATE TABLE "comment_tasks" (
    "comment_id" INTEGER NOT NULL,
    "task_id" INTEGER NOT NULL,

    CONSTRAINT "comment_tasks_pkey" PRIMARY KEY ("comment_id","task_id")
);

-- CreateTable
CREATE TABLE "comment_users" (
    "comment_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "comment_users_pkey" PRIMARY KEY ("comment_id","user_id")
);

-- AddForeignKey
ALTER TABLE "comment_projects" ADD CONSTRAINT "comment_projects_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_projects" ADD CONSTRAINT "comment_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_tasks" ADD CONSTRAINT "comment_tasks_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_tasks" ADD CONSTRAINT "comment_tasks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_users" ADD CONSTRAINT "comment_users_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comment_users" ADD CONSTRAINT "comment_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
