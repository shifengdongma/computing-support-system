#!/bin/bash
#
# 算力支撑管理系统 - 停止脚本
# 停止 Mock 后端 + Vite 开发服务器
#

PROJECT_DIR="/www/算力支撑管理系统"
PID_DIR="$PROJECT_DIR/.pids"
DEV_PORT=5174
MOCK_PORT=8080

echo "============================================"
echo "  停止算力支撑管理系统"
echo "============================================"

# ============================================================
# -1. 停止 Mock 后端 (端口 8080)
# ============================================================
echo "[-1/3] 停止 Mock 后端 (端口 $MOCK_PORT)..."

# 按 PID 文件
if [ -f "$PID_DIR/mock-backend.pid" ]; then
    MPID=$(cat "$PID_DIR/mock-backend.pid" 2>/dev/null)
    if [ -n "$MPID" ] && kill -0 "$MPID" 2>/dev/null; then
        kill "$MPID" 2>/dev/null || true
        echo "  → Mock 后端已停止 (PID: $MPID)"
    fi
    rm -f "$PID_DIR/mock-backend.pid"
fi

# 按端口强制清理
if fuser -s ${MOCK_PORT}/tcp 2>/dev/null; then
    echo "  → 端口 $MOCK_PORT 被占用，强制释放..."
    fuser -k -9 ${MOCK_PORT}/tcp 2>/dev/null || true
    sleep 1
fi
echo "  → Mock 后端已停止"
echo ""

# ============================================================
# 0. 先停止守护进程（防止它在我们停 Vite 时自动重启）
# ============================================================
echo "[0/3] 停止 Vite 守护进程..."

if [ -f "$PID_DIR/watchdog.pid" ]; then
    WPID=$(cat "$PID_DIR/watchdog.pid" 2>/dev/null)
    if [ -n "$WPID" ] && kill -0 $WPID 2>/dev/null; then
        kill $WPID 2>/dev/null || true
        echo "  → 守护进程已停止 (PID: $WPID)"
    fi
fi
# 兜底：按命令行特征匹配
WDOG_PIDS=$(pgrep -f "while.*sleep.*curl.*127.0.0.1.*$DEV_PORT" 2>/dev/null || true)
if [ -n "$WDOG_PIDS" ]; then
    kill $WDOG_PIDS 2>/dev/null || true
fi


# ============================================================
# 1. 停止 Vite — 按端口强制清理
# ============================================================
echo "[1/3] 停止 Vite 开发服务器 (端口 $DEV_PORT)..."

# 先尝试用 fuser 杀掉占用 DEV_PORT 的进程（最可靠）
if fuser -s ${DEV_PORT}/tcp 2>/dev/null; then
    echo "  → 端口 $DEV_PORT 被占用，强制释放..."
    fuser -k ${DEV_PORT}/tcp 2>/dev/null || true
    sleep 2
fi

# 二重保险：按进程名匹配杀残余
VITE_PIDS=$(pgrep -f "node.*vite" 2>/dev/null || true)
if [ -n "$VITE_PIDS" ]; then
    echo "  → 发现残余 Vite 进程: $VITE_PIDS"
    kill $VITE_PIDS 2>/dev/null || true
    sleep 1
    VITE_PIDS=$(pgrep -f "node.*vite" 2>/dev/null || true)
    if [ -n "$VITE_PIDS" ]; then
        kill -9 $VITE_PIDS 2>/dev/null || true
    fi
fi

# 三重保险：按端口再检查一次
if fuser -s ${DEV_PORT}/tcp 2>/dev/null; then
    echo "  → 端口仍被占用，强制杀掉..."
    fuser -k -9 ${DEV_PORT}/tcp 2>/dev/null || true
fi

echo "  → Vite 已停止"


# ============================================================
# 清理 PID 文件和日志
# ============================================================
if [ -d "$PID_DIR" ]; then
    rm -f "$PID_DIR/vite.pid" "$PID_DIR/watchdog.pid" "$PID_DIR/mock-backend.pid"
fi

# 最终确认端口已释放
sleep 1
if fuser -s ${DEV_PORT}/tcp 2>/dev/null; then
    echo ""
    echo "  ⚠ 警告: 端口 $DEV_PORT 仍被占用，请手动检查"
else
    echo ""
    echo "  ✅ 端口 $DEV_PORT 已释放"
fi

echo "  所有服务已停止"
echo "============================================"
