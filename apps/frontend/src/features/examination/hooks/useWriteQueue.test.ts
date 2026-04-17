// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWriteQueue } from "./useWriteQueue";

describe("useWriteQueue", () => {
  it("runs enqueued functions in strict order", async () => {
    const { result } = renderHook(() => useWriteQueue());
    const log: number[] = [];

    const delayed = (n: number, ms: number) =>
      new Promise<number>((resolve) =>
        setTimeout(() => {
          log.push(n);
          resolve(n);
        }, ms),
      );

    // Enqueue three tasks where the first is slowest — without the queue,
    // completion order would be 3, 2, 1.
    let p1: Promise<number> | undefined;
    let p2: Promise<number> | undefined;
    let p3: Promise<number> | undefined;
    act(() => {
      p1 = result.current.enqueue(() => delayed(1, 30));
      p2 = result.current.enqueue(() => delayed(2, 20));
      p3 = result.current.enqueue(() => delayed(3, 10));
    });

    await Promise.all([p1!, p2!, p3!]);
    expect(log).toEqual([1, 2, 3]);
  });

  it("runs later tasks even if an earlier one rejects", async () => {
    const { result } = renderHook(() => useWriteQueue());
    const log: string[] = [];

    let failing: Promise<unknown> | undefined;
    let succeeding: Promise<unknown> | undefined;
    act(() => {
      failing = result.current.enqueue(async () => {
        log.push("failing");
        throw new Error("boom");
      });
      succeeding = result.current.enqueue(async () => {
        log.push("succeeding");
        return "ok";
      });
    });

    await expect(failing!).rejects.toThrow("boom");
    await expect(succeeding!).resolves.toBe("ok");
    expect(log).toEqual(["failing", "succeeding"]);
  });

  it("surfaces the most recent failure via error state", async () => {
    const { result } = renderHook(() => useWriteQueue());

    await act(async () => {
      try {
        await result.current.enqueue(async () => {
          throw new Error("first-failure");
        });
      } catch {
        // expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("first-failure");
    });

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it("drain resolves after all enqueued tasks settle", async () => {
    const { result } = renderHook(() => useWriteQueue());
    const log: number[] = [];

    act(() => {
      result.current.enqueue(
        () =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              log.push(1);
              resolve();
            }, 10),
          ),
      );
      result.current.enqueue(async () => {
        log.push(2);
      });
    });

    await result.current.drain();
    expect(log).toEqual([1, 2]);
  });

  it("drain resolves even when a task in the chain rejected", async () => {
    const { result } = renderHook(() => useWriteQueue());

    act(() => {
      // Intentionally unhandled rejection from the caller's perspective is fine:
      // drain() should still settle — the queue's chain is independent.
      result.current.enqueue(async () => {
        throw new Error("ignored");
      }).catch(() => {});
      result.current.enqueue(async () => "done");
    });

    await expect(result.current.drain()).resolves.toBeUndefined();
  });
});
