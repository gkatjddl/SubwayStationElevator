export default function ChatGpt(){

    let inputData = '';
    let resData = '';

    const hSubmit = async (e)=>{
        e.preventDefault();
        if(!inputData) return;

        try{
            const res = await fetch('/api/gpt', {
                method:'POST',
                headers:{
                    'Content-Type' : 'application/json'
                },
                body: JSON.stringify({prompt:inputData})
            })
            
            if(!res.ok) throw new Error('Network error')

            const data = await res.json();
            resData = data.answer;
        }catch(error){
            console.error('gpt error:', error);
        }
    }

    return(
        <>
            <form onSubmit={hSubmit}>
                <input type="text" onChange={(e)=>{e.target.value}}/>
                <button type="submit">입력</button>
            </form>
        </>
    )
}