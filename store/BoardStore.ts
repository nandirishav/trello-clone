import { ID, databases, storage } from '@/appwrite';
import uploadImage from '@/utils/UploadImage';
import { getTodosGroupedByColumn } from '@/utils/getTodosGroupedByColumn';
import { create } from 'zustand'

export interface BoardState {
    board: Board;
    getBoard: ()=>void
    setBoardState: (board:Board)=>void
    updateTodoInDB: (todo:Todo, columnId: TypedColumns)=>void
    searchString: string;
    setSearchString: (searchString:string)=>void
    deleteTask: (taskIndex:number, todo: Todo, id: TypedColumns)=>void
    newTaskInput : string;
    setNewTaskInput : (input: string) => void;
    newTaskType : TypedColumns,
    setNewTaskType : (type: TypedColumns) => void;
    image: File|null;
    setImage: (image: File|null) => void;
    addTask: (todo: string, columnId: TypedColumns, image?:File|null) => void

}



export const useBoardStore = create<BoardState>((set, get) => ({
  board: {
    columns: new Map<TypedColumns, Column>()
  },

  getBoard: async ()=>{
    const board = await getTodosGroupedByColumn()
    set({board});
  },

  setBoardState: (board:Board)=>{
    set({board});
  },
  
  updateTodoInDB: async (todo:Todo, columnId: TypedColumns)=>{
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id,
      {
        title: todo.title,
        status: columnId,
      }
    );
  },
  deleteTask: async (taskIndex: number, todo:Todo, id:TypedColumns)=>{
    const newColumns = new Map(get().board.columns)

    newColumns.get(id)?.todos.splice(taskIndex, 1);
    set({board: {columns: newColumns}});

    if (todo.image){
      await storage.deleteFile(todo.image.bucketId, todo.image.fileId)
    }

    await databases.deleteDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
      todo.$id
    );
  },
  searchString:'',
  
  setSearchString: (searchString:string)=>{
    set({searchString});
  },
  newTaskInput: "",
  setNewTaskInput:(input: string) => {set({newTaskInput: input})},

  newTaskType: "todo" ,
  setNewTaskType: (type: TypedColumns) => {set({newTaskType: type})},

  image: null,
  setImage: (image: File|null) => {set({image})},

  addTask: async (todo: string, columnId: TypedColumns, image?:File|null)=>{
      let file: Image | undefined;

      if (image){
        const fileUploaded = await uploadImage(image);
        if (fileUploaded){
          file = {
            bucketId: fileUploaded.bucketId,
            fileId: fileUploaded.$id,
          };
        }
      }

      const {$id} = await databases.createDocument(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!,
        ID.unique(),
        {
          title: todo, 
          status: columnId, 
          //include image if exists
          ...(file && {image: JSON.stringify(file)}),
        }
      );

      set({newTaskInput: ""})
      set((state)=> {
        const newColumns = new Map(state.board.columns)
        const newTodo: Todo = {
          $id, 
          $createdAt: new Date().toISOString(),
          title: todo, 
          status: columnId,
          ...(file && { image: file })
        }
        const column = newColumns.get(columnId)
        if (!column){
          newColumns.set(columnId, {
            id: columnId,
            todos: [newTodo]
          });
        }else{
          newColumns.get(columnId)?.todos.push(newTodo)
        }

        return {
          board: {
            columns: newColumns
          }
        }
      })
  }


}))

