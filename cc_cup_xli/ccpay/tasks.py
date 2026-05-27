from celery import shared_task
from celery.utils.log import get_task_logger
from .services import distribute_daily_funds, expire_daily_funds

logger = get_task_logger(__name__)

@shared_task
def distribute_funds_task():
    logger.info("Executing distribute_funds_task...")
    try:
        count = distribute_daily_funds()
        logger.info(f"Successfully distributed funds to {count} users.")
        return f"Distributed to {count} users"
    except Exception as e:
        logger.error(f"Error in distribute_funds_task: {e}")
        raise e

@shared_task
def expire_funds_task():
    logger.info("Executing expire_funds_task...")
    try:
        count = expire_daily_funds()
        logger.info(f"Successfully expired funds for {count} users.")
        return f"Expired for {count} users"
    except Exception as e:
        logger.error(f"Error in expire_funds_task: {e}")
        raise e
