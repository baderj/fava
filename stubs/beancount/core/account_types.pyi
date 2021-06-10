# pylint: disable=missing-docstring,unused-argument,multiple-statements
from typing import NamedTuple
from typing import Optional

class AccountTypes(NamedTuple):
    assets: str
    liabilities: str
    equity: str
    income: str
    expenses: str

# )
# DEFAULT_ACCOUNT_TYPES: Any
#
# def get_account_sort_key(account_types: Any, account_name: Any): ...
# def get_account_type(account_name: Any): ...
# def is_account_type(account_type: Any, account_name: Any): ...
# def is_root_account(account_name: Any, account_types: Optional[Any] =
# ...): ...
# def is_balance_sheet_account(account_name: Any, account_types: Any): ...
# def is_income_statement_account(account_name: Any, account_types: Any): ...
# def is_equity_account(account_name: Any, account_types: Any): ...
def get_account_sign(
    account_name: str, account_types: Optional[AccountTypes] = ...
) -> int: ...
