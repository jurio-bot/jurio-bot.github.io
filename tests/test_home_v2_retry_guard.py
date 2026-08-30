import unittest
from pathlib import Path


class HomeRetryGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = Path("home-v2.js").read_text(encoding="utf-8")

    def test_all_modes_share_an_input_size_cap(self):
        self.assertIn("const MAX_LAB_INPUT_CHARS=200000", self.source)
        self.assertIn("if(input.value.length>MAX_LAB_INPUT_CHARS)", self.source)
        self.assertIn("input too large; max ${MAX_LAB_INPUT_CHARS} characters", self.source)

    def test_attempts_are_bounded_before_loop(self):
        self.assertIn("boundedNumber(x.attempts,'attempts',1,12,{integer:true})", self.source)
        self.assertIn("for(let i=0;i<a-1;i++)", self.source)

    def test_retry_inputs_require_finite_numbers(self):
        self.assertIn("if(!Number.isFinite(n))throw new Error(`${name} must be finite`)", self.source)
        self.assertIn("boundedNumber(x.base_ms,'base_ms',0,600000)", self.source)
        self.assertIn("boundedNumber(x.concurrency,'concurrency',1,10000)", self.source)
        self.assertIn("boundedNumber(x.success_rate,'success_rate',0,1)", self.source)

    def test_retry_outputs_fail_closed_on_overflow(self):
        self.assertIn("if(!Number.isFinite(backoff)||!Number.isFinite(pressure)||!Number.isFinite(eventual))", self.source)
        self.assertIn("throw new Error('retry calculation overflow')", self.source)


if __name__ == "__main__":
    unittest.main()
