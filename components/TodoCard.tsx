"use client";

import { useBoardStore } from "@/store/BoardStore";
import getImageUrl from "@/utils/getImageUrl";
import { XCircleIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { DraggableProvidedDragHandleProps, DraggableProvidedDraggableProps } from "react-beautiful-dnd";

type TodoCardProps = {
    todo: Todo;
    index: number;
    id: TypedColumns;
    innerRef: (element: HTMLElement| null)=>void;
    draggableProps: DraggableProvidedDraggableProps;
    dragHandleProps: DraggableProvidedDragHandleProps|null|undefined;    
}
function TodoCard({todo, index, id, innerRef, draggableProps, dragHandleProps}: TodoCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [deleteTask] = useBoardStore((state)=>[state.deleteTask]);

  useEffect(()=>{
    if (todo.image){
        const fetchImage = async () => {
            const url = await getImageUrl(todo.image!);
        if(url){
            setImageUrl(url.toString())
        }
    }

    fetchImage();
    }
  }, [todo]);

  return (
    <div
        className="bg-white rounded-md space-y-2 drop-shadow-md"
        {...draggableProps}
        {...dragHandleProps} 
        ref={innerRef}
    >
        <div className="flex items-center justify-between p-5">
            <p>{todo.title}</p>
            <button className="text-red-500 hover:text-red-600" onClick={()=>{deleteTask(index, todo, id)}}>
                <XCircleIcon className="ml-5 h-8 w-8" />
            </button>
        </div>
        {imageUrl && (
            <div className="h-full w-full rounded-b-md">
                <Image 
                    src={imageUrl}
                    alt="task image"
                    width={400}
                    height={200}
                    className="w-full object-contain rounded-b-md"
                />
            </div>
        )}
    </div>
  )
}

export default TodoCard