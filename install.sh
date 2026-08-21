#!/usr/bin/env bash
# easy-git 插件一键安装脚本（Linux / macOS）
#
# 用法：
#   ./install.sh            # 默认安装到 web profile
#   ./install.sh headless   # 指定 profile
#
# 自动完成：① 确保 pnpm ② dsh plugin add ③ 登记到 cordis.patch.yml
# 最后一步由用户手动：重启 dsh。

set -euo pipefail

PROFILE="${1:-web}"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE_DIR="$DSH_HOME/profiles/$PROFILE"

echo ""
echo "== easy-git 插件安装 =="
echo ""

if [ ! -d "$PROFILE_DIR" ]; then
  echo "找不到 profile 目录：$PROFILE_DIR（请先启动过一次 dsh，profile $PROFILE）" >&2
  exit 1
fi

# ① 确保 pnpm（dsh plugin 的下载器）
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[1/3] 检测到 pnpm 未安装，正在安装 pnpm ..."
  npm install -g pnpm
else
  echo "[1/3] pnpm 已就绪：v$(pnpm --version)"
fi

# ② 安装插件到 profile（dsh 命令不在 PATH 时（常通过 npx 运行 dsh），直接改 profile 依赖 + pnpm install）
echo "[2/3] 安装插件到 profile '$PROFILE' ..."
PKG_JSON="$PROFILE_DIR/package.json"
if command -v dsh >/dev/null 2>&1; then
  dsh plugin --profile "$PROFILE" add github:easysir10/easy-git
else
  echo "     未找到 dsh 命令（dsh 常通过 npx 运行），改为直接操作 profile ..."
  if [ ! -f "$PKG_JSON" ]; then
    echo "找不到 $PKG_JSON" >&2
    exit 1
  fi
  if grep -q '"@easysir10/easy-git"' "$PKG_JSON"; then
    echo "     profile 依赖里已有 @easysir10/easy-git（无需重装）。"
  else
    sed -i 's/^}$/  ,"@easysir10\/easy-git": "github:easysir10\/easy-git"\n}/' "$PKG_JSON"
    (cd "$PROFILE_DIR" && pnpm install)
  fi
fi

# ③ 登记到 cordis.patch.yml（已有则跳过；文件是 [] 则替换成插件行）
echo "[3/3] 登记到启动清单 ..."
PATCH="$PROFILE_DIR/cordis.patch.yml"
BLOCK=$'\n- insert:\n    - id: git-beginner-helper\n      name: \'@easysir10/easy-git\'\n'
if [ ! -f "$PATCH" ]; then
  printf '%s' "$BLOCK" > "$PATCH"
  echo "     已创建 cordis.patch.yml 并登记插件行。"
elif grep -q 'git-beginner-helper' "$PATCH"; then
  echo "     cordis.patch.yml 已有该插件行，跳过。"
else
  sed -i '/^\[\]$/d' "$PATCH"
  printf '%s' "$BLOCK" >> "$PATCH"
  echo "     已把插件行登记进 cordis.patch.yml。"
fi

echo ""
echo "✅ 安装完成！"
echo "   最后一步：重启 dsh（关掉重新打开）。"
echo "   重启后对助手说：帮我提交 / 拉取 / 推送 / 解决冲突 / 看下 git 现状"
echo ""
