import ChatWidget from "@/components/ChatWidget/ChatWidget";


export default function Page(){
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Security Assistant Demo</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Ask about OWASP or web security. The model may use retrieved Q&A context.
      </p>
      <div className="fixed bottom-4 right-4">
        <ChatWidget />
      </div>
    </main>
  );
}
