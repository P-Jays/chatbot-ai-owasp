// components/ChatWidget/ChatWidget.test.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatWidget from "./ChatWidget";
import { TestProviders } from "../../test/TestProviders";


vi.mock("@/lib/api", () => ({
  sendChatMessage: vi.fn().mockResolvedValue("hello from server"),
}));

vi.mock("./useChatStore", async () => {
  const actual = await vi.importActual<typeof import("./useChatStore")>(
    "./useChatStore"
  );
  return actual;
});

// Helper: render with reduced-motion wrapper
function renderChat() {
  return render(
    <TestProviders>
      <ChatWidget />
    </TestProviders>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ChatWidget", () => {
  it("opens when clicking the trigger and focuses the input", async () => {
    render(<ChatWidget />);
    const trigger = screen.getByRole("button", { name: /open chat/i });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: /security assistant/i });
    const input = within(dialog).getByRole("textbox", { name: /message input/i });
    expect(input).toHaveFocus();
    expect(input).toHaveFocus();
  });

    it("sends on Enter and shows response bubble", async () => {
    renderChat();
    const trigger = screen.getByRole("button", { name: /open chat/i });
    await userEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: /security assistant/i });
    const input = within(dialog).getByRole("textbox", { name: /message input/i });
    await userEvent.type(input, "hi there{enter}");

    // Assert inside the dialog to avoid catching exit clones
    const userBubble = await within(dialog).findByLabelText(/user message/i);
    expect(userBubble).toHaveTextContent("hi there");

    const assistantBubble = await within(dialog).findAllByLabelText(/assistant message/i);
    expect(assistantBubble.pop()).toHaveTextContent("hello from server");
  });

  it('restores focus to trigger when closed', async () => {
  renderChat();
  const trigger = screen.getByRole('button', { name: /open chat/i });
  await userEvent.click(trigger);

  const close = await screen.findByRole('button', { name: /close chat/i });
  await userEvent.click(close);

  // Wait until the trigger is back in the DOM
  const reopenedTrigger = await screen.findByRole('button', {
    name: /open chat/i,
  });

  // Let the queued microtask or rAF run
  await new Promise(r => setTimeout(r, 0));

  expect(reopenedTrigger).toHaveFocus();
});
});
