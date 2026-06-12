export interface Competition {
    id: string
    title: string
    description: string
    sopUrl: string
}

export const competitions: Competition[] = [
    {
        id: "webdev",
        title: "Web Development",
        description: "Build innovative web applications.",
        sopUrl: "./sop/webdev.pdf"
    },
    {
        id: "uiux",
        title: "UI/UX Design",
        description: "Create beautiful user experiences.",
        sopUrl: "./sop/uiux.pdf"
    },
    {
        id: "programming",
        title: "Programming",
        description: "Solve challenging algorithmic problems.",
        sopUrl: "./sop/programming.pdf"
    },
    {
        id: "test1",
        title: "test",
        description: "Solve challenging algorithmic problems.",
        sopUrl: "./sop/test.pdf"
    },
    {
        id: "test2",
        title: "test",
        description: "Solve challenging algorithmic problems.",
        sopUrl: "./sop/test.pdf"
    },
    {
        id: "programming3",
        title: "Programming",
        description: "Solve challenging algorithmic problems.",
        sopUrl: "./sop/programming.pdf"
    },
    {
        id: "lorem",
        title: "lorem",
        description: "Solve challenging algorithmic problems.",
        sopUrl: "./sop/lorem.pdf"
    },
]