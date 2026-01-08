
、、、
import OpenAI from "openai";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: process.env.DASHSCOPE_API_KEY,
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

async function main() {
    const completion = await openai.chat.completions.create({
        model: "qwen3-max-preview",  //此处以qwen3-max-preview为例，可按需更换模型名称。
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "你是谁？" }
        ],
    });
    console.log(JSON.stringify(completion))
}

main();
、、、

4.返回内容的格式。可选值:{"type":"text"}或{"type":"json_object"}。设置为{"type":"json_object"}时会输出标准格式的jsoN字符串。使用方法请参见:结构化输出。如果指定该参数为{"type":"json_object"}，您需要在System Message或User Message中指引模型输出JS0N格式，如:"请按照json格式输出。"
5.认真编写给到LLM的系统提示词，确保AI返回的直接就是echarts配置的ison数据，前端能够直接通过该对象实现渲染
